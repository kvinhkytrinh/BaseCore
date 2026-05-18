using BaseCore.Entities;
using BaseCore.Repository;
using BaseCore.Repository.EFCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BaseCore.APIService.Controllers
{
    [Route("api/vouchers")]
    [ApiController]
    [Authorize]
    public class VouchersController : ControllerBase
    {
        private readonly MySqlDbContext _context;
        private readonly IProductRepositoryEF _productRepository;

        public VouchersController(
            MySqlDbContext context,
            IProductRepositoryEF productRepository)
        {
            _context = context;
            _productRepository = productRepository;
        }
        [HttpPost("available")]
            public async Task<IActionResult> GetAvailableVouchers([FromBody] ValidateVoucherDto dto)
            {
                var userIdValue = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdValue) || !int.TryParse(userIdValue, out var userId))
                    return Unauthorized();

                if (dto.Items == null || dto.Items.Count == 0)
                    return BadRequest(new { message = "Order items are required" });

                decimal subTotal = 0;

                foreach (var item in dto.Items)
                {
                    if (item.ProductId <= 0 || item.Quantity <= 0)
                        return BadRequest(new { message = "Invalid order item" });

                    var product = await _productRepository.GetByIdAsync(item.ProductId);
                    if (product == null)
                        return BadRequest(new { message = $"Product {item.ProductId} not found" });

                    subTotal += product.Price * item.Quantity;
                }

                var now = DateTime.Now;

                var vouchers = await _context.Vouchers
                    .Where(x => x.IsActive && x.StartDate <= now && x.EndDate >= now)
                    .OrderByDescending(x => x.DiscountValue)
                    .ToListAsync();

                var result = new List<object>();

                foreach (var voucher in vouchers)
                {
                    var reason = "";
                    var isEligible = true;

                    if (voucher.UsageLimit.HasValue && voucher.UsedCount >= voucher.UsageLimit.Value)
                    {
                        isEligible = false;
                        reason = "Voucher usage limit reached";
                    }
                    else if (voucher.MinOrderAmount.HasValue && subTotal < voucher.MinOrderAmount.Value)
                    {
                        isEligible = false;
                        reason = $"Minimum order amount is {voucher.MinOrderAmount.Value:n0}";
                    }

                    var discountAmount = isEligible ? CalculateDiscount(voucher, subTotal) : 0;
                    var finalAmount = Math.Max(0, subTotal - discountAmount);

                    result.Add(new
                    {
                        voucher.Id,
                        voucher.Code,
                        voucher.Name,
                        voucher.DiscountType,
                        voucher.DiscountValue,
                        voucher.MaxDiscountAmount,
                        voucher.MinOrderAmount,
                        voucher.EndDate,
                        isEligible,
                        reason,
                        subTotalAmount = subTotal,
                        discountAmount,
                        finalAmount
                    });
                }

                return Ok(result);
            }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var vouchers = await _context.Vouchers
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            return Ok(vouchers);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetById(int id)
        {
            var voucher = await _context.Vouchers.FindAsync(id);
            if (voucher == null) return NotFound(new { message = "Voucher not found" });

            return Ok(voucher);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] Voucher voucher)
        {
            if (voucher == null)
                return BadRequest(new { message = "Voucher data is required" });

            var validationError = ValidateVoucherForSave(voucher);
            if (validationError != null)
                return BadRequest(new { message = validationError });

            voucher.Id = 0;
            voucher.Code = voucher.Code.Trim().ToUpper();
            voucher.CreatedAt = DateTime.Now;

            var codeExists = await _context.Vouchers.AnyAsync(x => x.Code == voucher.Code);
            if (codeExists)
                return BadRequest(new { message = "Voucher code already exists" });

            _context.Vouchers.Add(voucher);
            await _context.SaveChangesAsync();

            return Ok(voucher);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] Voucher dto)
        {
            var voucher = await _context.Vouchers.FindAsync(id);
            if (voucher == null) return NotFound(new { message = "Voucher not found" });

            var validationError = ValidateVoucherForSave(dto);
            if (validationError != null)
                return BadRequest(new { message = validationError });

            var code = dto.Code.Trim().ToUpper();
            var codeExists = await _context.Vouchers.AnyAsync(x => x.Id != id && x.Code == code);
            if (codeExists)
                return BadRequest(new { message = "Voucher code already exists" });

            voucher.Code = code;
            voucher.Name = dto.Name.Trim();
            voucher.DiscountType = dto.DiscountType.Trim();
            voucher.DiscountValue = dto.DiscountValue;
            voucher.MaxDiscountAmount = dto.MaxDiscountAmount;
            voucher.MinOrderAmount = dto.MinOrderAmount;
            voucher.UsageLimit = dto.UsageLimit;
            voucher.StartDate = dto.StartDate;
            voucher.EndDate = dto.EndDate;
            voucher.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return Ok(voucher);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var voucher = await _context.Vouchers.FindAsync(id);
            if (voucher == null) return NotFound(new { message = "Voucher not found" });

            var hasUsage = await _context.VoucherUsages.AnyAsync(x => x.VoucherId == id);
            if (hasUsage)
            {
                voucher.IsActive = false;
                await _context.SaveChangesAsync();
                return Ok(new { message = "Voucher has usage history, so it was deactivated instead of deleted", voucher });
            }

            _context.Vouchers.Remove(voucher);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Voucher deleted successfully" });
        }

        [HttpPost("validate")]
        public async Task<IActionResult> Validate([FromBody] ValidateVoucherDto dto)
        {
            var userIdValue = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdValue) || !int.TryParse(userIdValue, out var userId))
                return Unauthorized();

            if (dto == null || string.IsNullOrWhiteSpace(dto.Code))
                return BadRequest(new { message = "Voucher code is required" });

            if (dto.Items == null || dto.Items.Count == 0)
                return BadRequest(new { message = "Order items are required" });

            decimal subTotal = 0;

            foreach (var item in dto.Items)
            {
                if (item.ProductId <= 0 || item.Quantity <= 0)
                    return BadRequest(new { message = "Invalid order item" });

                var product = await _productRepository.GetByIdAsync(item.ProductId);
                if (product == null)
                    return BadRequest(new { message = $"Product {item.ProductId} not found" });

                subTotal += product.Price * item.Quantity;
            }

            var voucherCode = dto.Code.Trim().ToUpper();

            var voucher = await _context.Vouchers
                .FirstOrDefaultAsync(x => x.Code.ToUpper() == voucherCode);

            if (voucher == null)
                return BadRequest(new { message = "Voucher not found" });

            var now = DateTime.Now;

            if (!voucher.IsActive)
                return BadRequest(new { message = "Voucher is inactive" });

            if (voucher.StartDate > now || voucher.EndDate < now)
                return BadRequest(new { message = "Voucher is expired or not started" });

            if (voucher.MinOrderAmount.HasValue && subTotal < voucher.MinOrderAmount.Value)
                return BadRequest(new { message = $"Minimum order amount is {voucher.MinOrderAmount.Value:n0}" });

            if (voucher.UsageLimit.HasValue && voucher.UsedCount >= voucher.UsageLimit.Value)
                return BadRequest(new { message = "Voucher usage limit reached" });

            var discountAmount = CalculateDiscount(voucher, subTotal);
            var finalAmount = Math.Max(0, subTotal - discountAmount);

            return Ok(new
            {
                voucherId = voucher.Id,
                code = voucher.Code,
                name = voucher.Name,
                subTotalAmount = subTotal,
                discountAmount,
                finalAmount,
                message = "Voucher applied successfully"
            });
        }

        private static decimal CalculateDiscount(Voucher voucher, decimal subTotal)
        {
            decimal discountAmount = 0;

            if (voucher.DiscountType.Equals("Percent", StringComparison.OrdinalIgnoreCase))
            {
                discountAmount = subTotal * voucher.DiscountValue / 100;

                if (voucher.MaxDiscountAmount.HasValue)
                {
                    discountAmount = Math.Min(discountAmount, voucher.MaxDiscountAmount.Value);
                }
            }
            else if (voucher.DiscountType.Equals("Fixed", StringComparison.OrdinalIgnoreCase))
            {
                discountAmount = voucher.DiscountValue;
            }

            return Math.Min(discountAmount, subTotal);
        }

        private static string? ValidateVoucherForSave(Voucher voucher)
        {
            if (voucher == null) return "Voucher data is required";
            if (string.IsNullOrWhiteSpace(voucher.Code)) return "Voucher code is required";
            if (string.IsNullOrWhiteSpace(voucher.Name)) return "Voucher name is required";
            if (string.IsNullOrWhiteSpace(voucher.DiscountType)) return "Discount type is required";

            var isPercent = voucher.DiscountType.Equals("Percent", StringComparison.OrdinalIgnoreCase);
            var isFixed = voucher.DiscountType.Equals("Fixed", StringComparison.OrdinalIgnoreCase);

            if (!isPercent && !isFixed)
                return "Discount type must be Percent or Fixed";

            if (voucher.DiscountValue <= 0)
                return "Discount value must be greater than 0";

            if (isPercent && voucher.DiscountValue > 100)
                return "Percent discount cannot be greater than 100";

            if (voucher.MaxDiscountAmount.HasValue && voucher.MaxDiscountAmount.Value < 0)
                return "Max discount amount cannot be negative";

            if (voucher.MinOrderAmount.HasValue && voucher.MinOrderAmount.Value < 0)
                return "Minimum order amount cannot be negative";

            if (voucher.UsageLimit.HasValue && voucher.UsageLimit.Value <= 0)
                return "Usage limit must be greater than 0";

            if (voucher.EndDate < voucher.StartDate)
                return "End date must be greater than or equal to start date";

            return null;
        }
    }

    public class ValidateVoucherDto
    {
        public string Code { get; set; } = "";

        public List<VoucherOrderItemDto> Items { get; set; } = new();
    }

    public class VoucherOrderItemDto
    {
        public int ProductId { get; set; }

        public int Quantity { get; set; }
    }
}
