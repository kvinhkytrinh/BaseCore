using Microsoft.EntityFrameworkCore;
using BaseCore.Common;
using BaseCore.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace BaseCore.Repository.EFCore
{
    public class OrderRepositoryEF : IOrderRepositoryEF
    {
        private readonly MySqlDbContext _context;

        public OrderRepositoryEF(MySqlDbContext context)
        {
            _context = context;
        }

        public async Task<List<Order>> GetByUserAsync(int userId)
        {
            return await _context.Orders
                .Where(o => o.UserId == userId)
                .ToListAsync();
        }

        public async Task<Order?> GetWithDetailsAsync(int id)
        {
            return await _context.Orders
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<List<Order>> GetByStatusAsync(Enums.OrderStatus status)
        {
            return await _context.Orders
                .Where(o => o.Status == status)
                .ToListAsync();
        }

        public async Task<Order?> GetByIdAsync(int id)
        {
            return await _context.Orders.FindAsync(id);
        }

        public async Task<List<Order>> GetAllAsync()
        {
            return await _context.Orders.ToListAsync();
        }

        public async Task<List<Order>> GetFilteredAsync(IReadOnlyCollection<Enums.OrderStatus>? statuses, DateTime? startDate, DateTime? endDate, int page, int pageSize)
        {
            return await ApplyFilters(_context.Orders.AsQueryable(), statuses, startDate, endDate)
                .OrderByDescending(o => o.OrderDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> CountFilteredAsync(IReadOnlyCollection<Enums.OrderStatus>? statuses, DateTime? startDate, DateTime? endDate)
        {
            return await ApplyFilters(_context.Orders.AsQueryable(), statuses, startDate, endDate)
                .CountAsync();
        }

        public async Task<decimal> SumByStatusesAsync(IReadOnlyCollection<Enums.OrderStatus> statuses, DateTime? startDate, DateTime? endDate)
        {
            return await ApplyFilters(_context.Orders.AsQueryable(), statuses, startDate, endDate)
                .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;
        }

        private static IQueryable<Order> ApplyFilters(IQueryable<Order> query, IReadOnlyCollection<Enums.OrderStatus>? statuses, DateTime? startDate, DateTime? endDate)
        {
            if (statuses != null && statuses.Count > 0)
            {
                query = query.Where(o => statuses.Contains(o.Status));
            }

            if (startDate.HasValue)
            {
                var start = startDate.Value.Date;
                query = query.Where(o => o.OrderDate >= start);
            }

            if (endDate.HasValue)
            {
                var endExclusive = endDate.Value.Date.AddDays(1);
                query = query.Where(o => o.OrderDate < endExclusive);
            }

            return query;
        }

        public async Task<Order> AddAsync(Order order)
        {
            await _context.Orders.AddAsync(order);
            await _context.SaveChangesAsync();
            return order;
        }

        public async Task UpdateAsync(Order order)
        {
            _context.Orders.Update(order);
            await _context.SaveChangesAsync();
        }
    }
}
