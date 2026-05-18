using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseCore.Entities;
using BaseCore.Services;
using BaseCore.Repository.EFCore;
using BaseCore.Common;
using System;
using System.Security.Claims;
using BaseCore.Repository;
using Microsoft.EntityFrameworkCore;

namespace BaseCore.APIService.Controllers
{
    /// <summary>
    /// Order API Controller
    /// Teaching: RESTful API, Business Logic, Authentication (Bài 10, 11)
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderRepositoryEF _orderRepository;
        private readonly IOrderDetailRepositoryEF _orderDetailRepository;
        private readonly IProductRepositoryEF _productRepository;
        private readonly IOrderService _orderService;
        private readonly MySqlDbContext _context;
        public OrdersController(
            IOrderRepositoryEF orderRepository,
            IOrderDetailRepositoryEF orderDetailRepository,
            IProductRepositoryEF productRepository,
            IOrderService orderService,
            MySqlDbContext context)
        {
            _orderRepository = orderRepository;
            _orderDetailRepository = orderDetailRepository;
            _productRepository = productRepository;
            _orderService = orderService;
            _context = context;
        }
        public static decimal CalculateDiscount(Voucher voucher, decimal subTotal)
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

        /// <summary>
        /// Get orders for current user
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out var userIntId))
                return Unauthorized();

            var orders = await _orderRepository.GetByUserAsync(userIntId);
            return Ok(orders);
        }

        /// <summary>
        /// Get all orders (Admin only)
        /// </summary>
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllOrders([FromQuery] OrderQueryDto query)
        {
            var orders = await _orderService.GetOrdersAsync(query);
            return Ok(orders);
        }

        /// <summary>
        /// Get order statistics for current admin filters
        /// </summary>
        [HttpGet("statistics")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetStatistics([FromQuery] OrderQueryDto query)
        {
            var statistics = await _orderService.GetOrderStatisticsAsync(query);
            return Ok(statistics);
        }

        /// <summary>
        /// Get order by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null) return NotFound(new { message = "Order not found" });

            var details = await _orderDetailRepository.GetByOrderAsync(id);
            
            // Set ProductName from Product object
            foreach (var detail in details)
            {
                if (detail.Product != null)
                {
                    detail.ProductName = detail.Product.Name;
                }
            }
            
            return Ok(new { order, details });
        }

        /// <summary>
        /// Create new order
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateOrderDto dto)
        {
            try
            {
                if (dto == null || dto.Items == null || dto.Items.Count == 0)
                {
                    return BadRequest(new { message = "Order items are required" });
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out var userIntId))
                    return Unauthorized();

                UserDeliveryAddress? deliveryAddress = null;

                if (dto.DeliveryAddressId.HasValue)
                {
                    deliveryAddress = await _context.UserDeliveryAddresses
                        .FirstOrDefaultAsync(x =>
                            x.Id == dto.DeliveryAddressId.Value &&
                            x.UserId == userIntId);

                    if (deliveryAddress == null)
                    {
                        return BadRequest(new { message = "Delivery address not found" });
                    }
                }
                else
                {
                    if (
                        string.IsNullOrWhiteSpace(dto.CustomerName) ||
                        string.IsNullOrWhiteSpace(dto.CustomerPhone) ||
                        string.IsNullOrWhiteSpace(dto.ShippingAddress)
                    )
                    {
                        return BadRequest(new { message = "Delivery information is required" });
                    }
                }

                // Validate products and calculate total
                decimal subTotalAmount = 0;
                decimal discountAmount = 0;
                decimal finalAmount = 0;
                Voucher? voucher = null;
                var orderDetails = new List<OrderDetail>();

                foreach (var item in dto.Items)
                {
                    if (item.ProductId <= 0 || item.Quantity <= 0)
                        return BadRequest(new { message = "Invalid order item" });

                    var product = await _productRepository.GetByIdAsync(item.ProductId);
                    if (product == null)
                        return BadRequest(new { message = $"Product {item.ProductId} not found" });

                    if (product.Stock < item.Quantity)
                        return BadRequest(new { message = $"Insufficient stock for {product.Name}" });

                    subTotalAmount += product.Price * item.Quantity;

                    orderDetails.Add(new OrderDetail
                    {
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        UnitPrice = product.Price,
                        ProductName = product.Name
                    });

                }

                if (!string.IsNullOrWhiteSpace(dto.VoucherCode))
                {
                    var voucherCode = dto.VoucherCode.Trim().ToUpper();

                    voucher = await _context.Vouchers
                        .FirstOrDefaultAsync(x => x.Code.ToUpper() == voucherCode);

                    if (voucher == null)
                        return BadRequest(new { message = "Voucher not found" });

                    var now = DateTime.Now;

                    if (!voucher.IsActive)
                        return BadRequest(new { message = "Voucher is inactive" });

                    if (voucher.StartDate > now || voucher.EndDate < now)
                        return BadRequest(new { message = "Voucher is expired or not started" });

                    if (voucher.MinOrderAmount.HasValue && subTotalAmount < voucher.MinOrderAmount.Value)
                        return BadRequest(new { message = $"Minimum order amount is {voucher.MinOrderAmount.Value:n0}" });

                    if (voucher.UsageLimit.HasValue && voucher.UsedCount >= voucher.UsageLimit.Value)
                        return BadRequest(new { message = "Voucher usage limit reached" });

                    discountAmount = CalculateDiscount(voucher, subTotalAmount);
                }

                finalAmount = Math.Max(0, subTotalAmount - discountAmount);

                foreach (var item in dto.Items)
                {
                    var product = await _productRepository.GetByIdAsync(item.ProductId);
                    if (product != null)
                    {
                        product.Stock -= item.Quantity;
                        await _productRepository.UpdateAsync(product);
                    }
                }

               var order = new Order
                    {
                        UserId = userIntId,
                        OrderDate = DateTime.Now,
                        SubTotalAmount = subTotalAmount,
                        DiscountAmount = discountAmount,
                        FinalAmount = finalAmount,
                        TotalAmount = finalAmount,
                        VoucherId = voucher?.Id,
                        VoucherCode = voucher?.Code,
                        Status = Enums.OrderStatus.PendingApproval,

                        CustomerName = deliveryAddress?.FullName ?? dto.CustomerName?.Trim() ?? "",
                        CustomerPhone = deliveryAddress?.Phone ?? dto.CustomerPhone?.Trim() ?? "",
                        CustomerEmail = deliveryAddress?.Email ?? dto.CustomerEmail?.Trim() ?? "",
                        ShippingAddress = deliveryAddress?.Address ?? dto.ShippingAddress?.Trim() ?? ""
                    };
                await _orderRepository.AddAsync(order);

                // Add order details
                foreach (var detail in orderDetails)
                {
                    detail.OrderId = order.Id;
                }
                await _orderDetailRepository.AddRangeAsync(orderDetails);

                if (voucher != null)
                {
                    voucher.UsedCount += 1;

                    _context.VoucherUsages.Add(new VoucherUsage
                    {
                        VoucherId = voucher.Id,
                        UserId = userIntId,
                        OrderId = order.Id,
                        UsedAt = DateTime.Now
                    });

                    await _context.SaveChangesAsync();
                }

                return CreatedAtAction(nameof(GetById), new { id = order.Id }, new { order, details = orderDetails });
            }
            catch (Exception ex)
            {
                var detail = ex.InnerException?.Message ?? ex.Message;
                return BadRequest(new { message = "Failed to create order: " + detail });
            }
        }

        /// <summary>
        /// Update order status
        /// </summary>
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null) return NotFound(new { message = "Order not found" });

            if (!Enum.TryParse<Enums.OrderStatus>(dto.Status, true, out var status))
            {
                return BadRequest(new { message = "Invalid order status" });
            }

            var allowedStatuses = new[]
            {
                Enums.OrderStatus.PendingApproval,
                Enums.OrderStatus.Shipping,
                Enums.OrderStatus.Completed,
                Enums.OrderStatus.Cancelled
            };

            if (!allowedStatuses.Contains(status))
            {
                return BadRequest(new { message = "Order status must be Pending, Shipping, Completed, or Cancelled" });
            }

            order.Status = status;
            await _orderRepository.UpdateAsync(order);

            return Ok(order);
        }

        /// <summary>
        /// Cancel order
        /// </summary>
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null) return NotFound(new { message = "Order not found" });

            if (order.Status == Enums.OrderStatus.Completed)
                return BadRequest(new { message = "Cannot cancel completed order" });

            // Restore stock
            var details = await _orderDetailRepository.GetByOrderAsync(id);
            foreach (var detail in details)
            {
                var product = await _productRepository.GetByIdAsync(detail.ProductId);
                if (product != null)
                {
                    product.Stock += detail.Quantity;
                    await _productRepository.UpdateAsync(product);
                }
            }

            order.Status = Enums.OrderStatus.Cancelled;
            await _orderRepository.UpdateAsync(order);

            return Ok(new { message = "Order cancelled successfully", order });
        }

        /// <summary>
        /// Get pending orders for admin approval
        /// </summary>
        [HttpGet("pending")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPendingOrders()
        {
            var orders = await _orderRepository.GetByStatusAsync(Enums.OrderStatus.PendingApproval);
            return Ok(orders);
        }

        /// <summary>
        /// Approve order (Admin only)
        /// </summary>
        [HttpPut("{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveOrder(int id, [FromBody] ApprovalRequest request)
        {
            var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(adminId) || !int.TryParse(adminId, out var adminIntId))
                return Unauthorized();

            var success = await _orderService.ApproveOrderAsync(id, adminIntId, request?.Notes);
            if (!success)
                return BadRequest(new { message = "Cannot approve this order" });

            return Ok(new { message = "Order approved successfully" });
        }

        /// <summary>
        /// Reject order (Admin only)
        /// </summary>
        [HttpPut("{id}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectOrder(int id, [FromBody] ApprovalRequest request)
        {
            if (string.IsNullOrEmpty(request?.Notes))
                return BadRequest(new { message = "Rejection reason is required" });

            var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(adminId) || !int.TryParse(adminId, out var adminIntId))
                return Unauthorized();

            var success = await _orderService.RejectOrderAsync(id, adminIntId, request.Notes);
            if (!success)
                return BadRequest(new { message = "Cannot reject this order" });

            return Ok(new { message = "Order rejected successfully" });
        }
    }

    public class CreateOrderDto
    {
        public List<OrderItemDto> Items { get; set; } = new();
        public string? CustomerName { get; set; }
        public string? VoucherCode { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerEmail { get; set; }
        public string? ShippingAddress { get; set; }
        public int? DeliveryAddressId { get; set; }
    }

    public class OrderItemDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class UpdateStatusDto
    {
        public string Status { get; set; } = "";
    }
    public class ApprovalRequest
    {
        public string? Notes { get; set; }
    }}
