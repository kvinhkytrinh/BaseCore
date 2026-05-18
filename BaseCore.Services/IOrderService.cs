using BaseCore.Common;
using BaseCore.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BaseCore.Services
{
    public interface IOrderService
    {
        Task<Order> CreateOrderAsync(Order order);
        Task<List<Order>> GetOrdersByUserIdAsync(int userId);
        Task<Order?> GetOrderByIdAsync(int id);
        // them cho admin
        Task<List<Order>> GetAllOrdersAsync();
        Task<PagedResult<Order>> GetOrdersAsync(OrderQueryDto query);
        Task<OrderStatisticsDto> GetOrderStatisticsAsync(OrderQueryDto query);
        Task<List<Order>> GetPendingOrdersAsync();
        Task<bool> ApproveOrderAsync(int orderId, int adminId, string? notes = null);
        Task<bool> RejectOrderAsync(int orderId, int adminId, string notes);
        Task<bool> CancelOrderAsync(int orderId, int userId, string notes);
    }
}
