using System.Collections.Generic;
using System;

namespace BaseCore.Services
{
    public class OrderQueryDto
    {
        public string? Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalItems { get; set; }
        public int TotalPages { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
    }

    public class OrderStatisticsDto
    {
        public decimal CompletedRevenue { get; set; }
        public int CompletedCount { get; set; }
    }
}
