using BaseCore.Common;
using BaseCore.Entities;
using System.Collections.Generic;
using System;
using System.Threading.Tasks;

namespace BaseCore.Repository.EFCore
{
    public interface IOrderRepositoryEF
    {
        Task<List<Order>> GetByUserAsync(int userId);
        Task<Order?> GetWithDetailsAsync(int id);
        Task<List<Order>> GetByStatusAsync(Enums.OrderStatus status);
        Task<Order?> GetByIdAsync(int id);
        Task<List<Order>> GetAllAsync();
        Task<List<Order>> GetFilteredAsync(IReadOnlyCollection<Enums.OrderStatus>? statuses, DateTime? startDate, DateTime? endDate, int page, int pageSize);
        Task<int> CountFilteredAsync(IReadOnlyCollection<Enums.OrderStatus>? statuses, DateTime? startDate, DateTime? endDate);
        Task<decimal> SumByStatusesAsync(IReadOnlyCollection<Enums.OrderStatus> statuses, DateTime? startDate, DateTime? endDate);
        Task<Order> AddAsync(Order order);
        Task UpdateAsync(Order order);
    }
}
