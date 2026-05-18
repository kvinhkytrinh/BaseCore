using BaseCore.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BaseCore.Services
{
    public interface IProductService
    {
        Task<List<Product>> GetAllProductsAsync();
        Task<Product?> GetProductByIdAsync(int id);
        Task<Product> CreateProductAsync(Product product);
        Task UpdateProductAsync(Product product);
        Task DeleteProductAsync(int id);
        Task<(List<Product> Products, int TotalCount)> SearchProductsAsync (
            string? keyword, 
            int? categoryId, 
            string? priceRange, 
            string? size, 
            int page, 
            int pageSize,
            string sortType
            );
}
}
