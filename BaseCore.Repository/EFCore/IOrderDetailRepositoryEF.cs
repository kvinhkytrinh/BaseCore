using BaseCore.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BaseCore.Repository.EFCore
{
    public interface IOrderDetailRepositoryEF
    {
        Task<List<OrderDetail>> GetByOrderAsync(int orderId);
        Task<OrderDetail?> GetByIdAsync(int id);
        Task AddRangeAsync(IEnumerable<OrderDetail> orderDetails);
    }
}