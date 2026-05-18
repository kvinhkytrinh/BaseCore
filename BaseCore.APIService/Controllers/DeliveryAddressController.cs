// BaseCore.APIService/Controllers/DeliveryAddressesController.cs
using BaseCore.Entities;
using BaseCore.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BaseCore.APIService.Controllers
{
    [Route("api/delivery-addresses")]
    [ApiController]
    [Authorize]
    public class DeliveryAddressesController : ControllerBase
    {
        private readonly MySqlDbContext _context;

        public DeliveryAddressesController(MySqlDbContext context)
        {
            _context = context;
        }

        private bool TryGetUserId(out int userId)
        {
            var value = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(value, out userId);
        }

        [HttpGet]
        public async Task<IActionResult> GetMyAddresses()
        {
            if (!TryGetUserId(out var userId)) return Unauthorized();

            var addresses = await _context.UserDeliveryAddresses
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.IsDefault)
                .ThenByDescending(x => x.CreatedAt)
                .ToListAsync();

            return Ok(addresses);
        }

        [HttpPost]
        public async Task<IActionResult> Create(UserDeliveryAddress dto)
        {
            if (!TryGetUserId(out var userId)) return Unauthorized();

            dto.Id = 0;
            dto.UserId = userId;
            dto.CreatedAt = DateTime.Now;

            if (dto.IsDefault)
            {
                var oldDefaults = await _context.UserDeliveryAddresses
                    .Where(x => x.UserId == userId && x.IsDefault)
                    .ToListAsync();

                foreach (var item in oldDefaults)
                    item.IsDefault = false;
            }

            _context.UserDeliveryAddresses.Add(dto);
            await _context.SaveChangesAsync();

            return Ok(dto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UserDeliveryAddress dto)
        {
            if (!TryGetUserId(out var userId)) return Unauthorized();

            var address = await _context.UserDeliveryAddresses
                .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

            if (address == null) return NotFound();

            address.FullName = dto.FullName;
            address.Phone = dto.Phone;
            address.Email = dto.Email;
            address.Address = dto.Address;
            address.IsDefault = dto.IsDefault;

            if (address.IsDefault)
            {
                var oldDefaults = await _context.UserDeliveryAddresses
                    .Where(x => x.UserId == userId && x.Id != id && x.IsDefault)
                    .ToListAsync();

                foreach (var item in oldDefaults)
                    item.IsDefault = false;
            }

            await _context.SaveChangesAsync();

            return Ok(address);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (!TryGetUserId(out var userId)) return Unauthorized();

            var address = await _context.UserDeliveryAddresses
                .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

            if (address == null) return NotFound();

            _context.UserDeliveryAddresses.Remove(address);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Deleted successfully" });
        }
    }
}