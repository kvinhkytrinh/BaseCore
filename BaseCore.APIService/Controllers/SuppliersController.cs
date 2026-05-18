using BaseCore.Entities;
using BaseCore.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class SuppliersController : ControllerBase
{
    private readonly MySqlDbContext _context;

    public SuppliersController(MySqlDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string keyword = "",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10
    )
{
    page = Math.Max(page, 1);
    pageSize = Math.Max(pageSize, 1);

    var query = _context.Suppliers.AsQueryable();

    if (!string.IsNullOrWhiteSpace(keyword))
    {
        keyword = keyword.Trim().ToLower();

        query = query.Where(x =>
            (x.Name ?? "").ToLower().Contains(keyword) ||
            (x.ContactName ?? "").ToLower().Contains(keyword) ||
            (x.Phone ?? "").ToLower().Contains(keyword) ||
            (x.Email ?? "").ToLower().Contains(keyword) ||
            (x.Address ?? "").ToLower().Contains(keyword) ||
            (x.SupplyType ?? "").ToLower().Contains(keyword) ||
            (x.Note ?? "").ToLower().Contains(keyword)
        );
    }

    var totalCount = await query.CountAsync();

    var suppliers = await query
        .OrderByDescending(x => x.Id)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();

    return Ok(new
    {
        data = suppliers,
        totalCount,
        page,
        pageSize,
        totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
    });
}
   

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var supplier = await _context.Suppliers.FindAsync(id);
        if (supplier == null) return NotFound();

        return Ok(supplier);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Supplier supplier)
    {
        _context.Suppliers.Add(supplier);
        await _context.SaveChangesAsync();

        return Ok(supplier);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Supplier supplier)
    {
        var existing = await _context.Suppliers.FindAsync(id);
        if (existing == null) return NotFound();

        existing.Name = supplier.Name;
        existing.ContactName = supplier.ContactName;
        existing.Phone = supplier.Phone;
        existing.Email = supplier.Email;
        existing.Address = supplier.Address;
        existing.SupplyType = supplier.SupplyType;
        existing.IsActive = supplier.IsActive;
        existing.Note = supplier.Note;

        await _context.SaveChangesAsync();

        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var supplier = await _context.Suppliers.FindAsync(id);
        if (supplier == null) return NotFound();

        _context.Suppliers.Remove(supplier);
        await _context.SaveChangesAsync();

        return Ok();
    }
}
