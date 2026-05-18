using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;

namespace BaseCore.Repository.EFCore
{
    /// <summary>
    /// Product Repository using Entity Framework Core
    /// </summary>
    public interface IProductRepositoryEF : IRepository<Product>
    {
        Task<(List<Product> Products, int TotalCount)> SearchAsync(string? keyword, int? categoryId, string? priceRange, string? size, int page, int pageSize, string sortType);
        Task<List<Product>> GetByCategoryAsync(int categoryId);
    }

    public class ProductRepositoryEF : Repository<Product>, IProductRepositoryEF
    {
        public ProductRepositoryEF(MySqlDbContext context) : base(context)
        {
        }

        public async Task<(List<Product> Products, int TotalCount)> SearchAsync(string? keyword, int? categoryId, string? priceRange, string? size, int page, int pageSize, string sortType)
        {
            var query = _dbSet.Include(p => p.Category).AsQueryable();

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                keyword = keyword.Trim().ToLower();
                var numericKeyword = keyword.Replace(",", "");

                if (int.TryParse(numericKeyword, out var id))
                {
                    query = query.Where(p =>
                        p.Id == id ||
                        p.Price == id ||
                        p.Name.ToLower().Contains(keyword) ||
                        (p.Description != null && p.Description.ToLower().Contains(keyword)));
                }
                else if (decimal.TryParse(numericKeyword, out var price))
                {
                    query = query.Where(p =>
                        p.Price == price ||
                        p.Name.ToLower().Contains(keyword) ||
                        (p.Description != null && p.Description.ToLower().Contains(keyword)));
                }
                else
                {
                    query = query.Where(p =>
                        p.Name.ToLower().Contains(keyword) ||
                        (p.Description != null && p.Description.ToLower().Contains(keyword)));
                }
            }

            if (categoryId.HasValue && categoryId > 0)
            {
                query = query.Where(p => p.CategoryId == categoryId);
            }

            if (!string.IsNullOrWhiteSpace(size))
            {
                var normalizedSize = size.Trim().ToLower();
                query = query.Where(p => p.Size != null && p.Size.ToLower() == normalizedSize);
            }

            if (!string.IsNullOrWhiteSpace(priceRange))
            {
                query = priceRange switch
                {
                    "under100" => query.Where(p => p.Price < 100000),
                    "100to200" => query.Where(p => p.Price >= 100000 && p.Price <= 200000),
                    "above200" => query.Where(p => p.Price > 200000),
                    _ => query
                };
            }

            var totalCount = await query.CountAsync();

            query = sortType switch
            {
                "priceAsc" => query.OrderBy(p => p.Price),
                "priceDesc" => query.OrderByDescending(p => p.Price),
                "newest" => query.OrderByDescending(p => p.Id),
                "nameAsc" => query.OrderBy(p => p.Name),
                _ => query.OrderByDescending(p => p.Id)
            };

            var products = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (products, totalCount);
        }

        public async Task<List<Product>> GetByCategoryAsync(int categoryId)
        {
            return await _dbSet
                .Where(p => p.CategoryId == categoryId)
                .Include(p => p.Category)
                .ToListAsync();
        }
    }
}
