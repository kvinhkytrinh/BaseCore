using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;
using BaseCore.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaseCore.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepositoryEF _orderRepository;
        private readonly IOrderDetailRepositoryEF _orderDetailRepository;
        private readonly IRepository<Product> _productRepository;

        public OrderService(IOrderRepositoryEF orderRepository, IOrderDetailRepositoryEF orderDetailRepository, IRepository<Product> productRepository)
        {
            _orderRepository = orderRepository;
            _orderDetailRepository = orderDetailRepository;
            _productRepository = productRepository;
        }

        public async Task<Order> CreateOrderAsync(Order order)
        {
            order.OrderDate = DateTime.UtcNow;
            order.Status = Enums.OrderStatus.PendingApproval;

            await _orderRepository.AddAsync(order);
            return order;
        }

        public async Task<List<Order>> GetOrdersByUserIdAsync(int userId)
        {
            return await _orderRepository.GetByUserAsync(userId);
        }

        public async Task<Order?> GetOrderByIdAsync(int id)
        {
            return await _orderRepository.GetWithDetailsAsync(id);
        }

        public async Task<List<Order>> GetAllOrdersAsync()
        {
            return await _orderRepository.GetAllAsync();
        }

        public async Task<PagedResult<Order>> GetOrdersAsync(OrderQueryDto query)
        {
            var page = query.Page < 1 ? 1 : query.Page;
            var pageSize = query.PageSize < 1 ? 10 : query.PageSize;
            pageSize = pageSize > 100 ? 100 : pageSize;
            var statuses = ResolveStatusGroup(query.Status);

            var totalItems = await _orderRepository.CountFilteredAsync(statuses, query.StartDate, query.EndDate);
            var items = await _orderRepository.GetFilteredAsync(statuses, query.StartDate, query.EndDate, page, pageSize);

            return new PagedResult<Order>
            {
                Items = items,
                TotalItems = totalItems,
                TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize),
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<OrderStatisticsDto> GetOrderStatisticsAsync(OrderQueryDto query)
        {
            var completedStatuses = new[]
            {
                Enums.OrderStatus.Completed,
                Enums.OrderStatus.Approved
            };

            return new OrderStatisticsDto
            {
                CompletedRevenue = await _orderRepository.SumByStatusesAsync(completedStatuses, query.StartDate, query.EndDate),
                CompletedCount = await _orderRepository.CountFilteredAsync(completedStatuses, query.StartDate, query.EndDate)
            };
        }

        public async Task<List<Order>> GetPendingOrdersAsync()
        {
            return await _orderRepository.GetByStatusAsync(Enums.OrderStatus.PendingApproval);
        }

        private static IReadOnlyCollection<Enums.OrderStatus>? ResolveStatusGroup(string? status)
        {
            if (string.IsNullOrWhiteSpace(status) || status.Equals("All", StringComparison.OrdinalIgnoreCase))
                return null;

            if (status.Equals("Pending", StringComparison.OrdinalIgnoreCase))
                return new[] { Enums.OrderStatus.PendingApproval };

            if (status.Equals("Shipping", StringComparison.OrdinalIgnoreCase))
                return new[] { Enums.OrderStatus.Shipping };

            if (status.Equals("Completed", StringComparison.OrdinalIgnoreCase))
                return new[] { Enums.OrderStatus.Completed, Enums.OrderStatus.Approved };

            if (status.Equals("Cancelled", StringComparison.OrdinalIgnoreCase))
                return new[] { Enums.OrderStatus.Cancelled, Enums.OrderStatus.Rejected };

            return Enum.TryParse<Enums.OrderStatus>(status, true, out var parsed)
                ? new[] { parsed }
                : null;
        }

        public async Task<bool> ApproveOrderAsync(int orderId, int adminId, string? notes = null)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            if (order == null || order.Status != Enums.OrderStatus.PendingApproval)
                return false;

            order.Status = Enums.OrderStatus.Approved;
            order.ApprovedAt = DateTime.UtcNow;
            order.ApprovedBy = adminId;
            order.ApprovalNotes = notes;

            await _orderRepository.UpdateAsync(order);
            return true;
        }

        public async Task<bool> RejectOrderAsync(int orderId, int adminId, string notes)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            if (order == null || order.Status != Enums.OrderStatus.PendingApproval)
                return false;

            order.Status = Enums.OrderStatus.Rejected;
            order.ApprovedAt = DateTime.UtcNow;
            order.ApprovedBy = adminId;
            order.ApprovalNotes = notes;

            await _orderRepository.UpdateAsync(order);
            return true;
        }

        public async Task<bool> CancelOrderAsync(int orderId, int userId, string notes)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            if (order == null || order.UserId != userId || 
                (order.Status != Enums.OrderStatus.PendingApproval && order.Status != Enums.OrderStatus.Approved))
                return false;

            order.Status = Enums.OrderStatus.Cancelled;
            order.ApprovalNotes = notes;

            await _orderRepository.UpdateAsync(order);
            return true;
        }
    }
}
