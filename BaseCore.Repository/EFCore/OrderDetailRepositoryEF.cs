using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaseCore.Repository.EFCore
{
    public class OrderDetailRepositoryEF : IOrderDetailRepositoryEF
    {
        private readonly MySqlDbContext _context;

        public OrderDetailRepositoryEF(MySqlDbContext context)
        {
            _context = context;
        }

        public async Task<List<OrderDetail>> GetByOrderAsync(int orderId)
        {
            return await _context.OrderDetails
                .Where(od => od.OrderId == orderId)
                .Include(od => od.Product)
                .ToListAsync();
        }

        public async Task<OrderDetail?> GetByIdAsync(int id)
        {
            return await _context.OrderDetails.FindAsync(id);
        }

        public async Task AddRangeAsync(IEnumerable<OrderDetail> orderDetails)
        {
            _context.OrderDetails.AddRange(orderDetails);
            await _context.SaveChangesAsync();
        }
    }
}