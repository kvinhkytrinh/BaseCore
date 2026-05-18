using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using BaseCore.Entities;
using BaseCore.Common;

namespace BaseCore.Repository
{
    /// <summary>
    /// Entity Framework Core DbContext for MySQL
    /// Used for teaching EF Core concepts (Bài 10)
    /// </summary>
    public class MySqlDbContext : DbContext
    {
        public MySqlDbContext(DbContextOptions<MySqlDbContext> options) : base(options)
        {
        }

        // DbSet for each entity
        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<UserDeliveryAddress> UserDeliveryAddresses { get; set; }
        public DbSet<Voucher> Vouchers { get; set; }
        public DbSet<VoucherUsage> VoucherUsages { get; set;}


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Voucher>(entity =>
                {
                    entity.HasKey(e => e.Id);
                    entity.Property(e => e.Id).UseIdentityColumn();

                    entity.Property(e => e.Code).HasMaxLength(50).IsRequired();
                    entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
                    entity.Property(e => e.DiscountType).HasMaxLength(20).IsRequired();

                    entity.Property(e => e.DiscountValue).HasPrecision(18, 2);
                    entity.Property(e => e.MaxDiscountAmount).HasPrecision(18, 2);
                    entity.Property(e => e.MinOrderAmount).HasPrecision(18, 2);

                    entity.HasIndex(e => e.Code).IsUnique();
                });

                modelBuilder.Entity<VoucherUsage>(entity =>
                {
                    entity.HasKey(e => e.Id);
                    entity.Property(e => e.Id).UseIdentityColumn();

                    entity.HasOne<Voucher>()
                        .WithMany()
                        .HasForeignKey(e => e.VoucherId)
                        .OnDelete(DeleteBehavior.Restrict);

                    entity.HasOne<User>()
                        .WithMany()
                        .HasForeignKey(e => e.UserId)
                        .OnDelete(DeleteBehavior.Restrict);

                    entity.HasOne<Order>()
                        .WithMany()
                        .HasForeignKey(e => e.OrderId)
                        .OnDelete(DeleteBehavior.Cascade);
                });
            modelBuilder.Entity<UserDeliveryAddress>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).UseIdentityColumn();

                entity.Property( e => e.FullName).HasMaxLength(100).IsRequired();
                entity.Property(e => e.Phone).HasMaxLength(20).IsRequired();
                entity.Property(e => e.Email).HasMaxLength(100).IsRequired();
                entity.Property(e => e.Address).HasMaxLength(500).IsRequired();

                entity.HasOne<User>()
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);       
               
            });

            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).UseIdentityColumn();
                entity.Property(e => e.UserName).HasMaxLength(50).IsRequired();
                entity.Property(e => e.Password).HasMaxLength(255).IsRequired();
                entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
                entity.Property(e => e.Email).HasMaxLength(100).IsRequired();
                entity.Property(e => e.Phone).HasMaxLength(20);
                entity.Property(e => e.Position).HasMaxLength(100);
                entity.Property(e => e.Image).HasMaxLength(500);
                entity.Property(e => e.Contact).HasMaxLength(500);
                entity.HasIndex(e => e.UserName).IsUnique();
                entity.HasIndex(e => e.Email).IsUnique();
                
            });

            // Configure Category entity
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).UseIdentityColumn();
                entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
                entity.Property(e => e.Description).HasMaxLength(500);
            });

            // Configure Product entity
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).UseIdentityColumn();
                entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Price).HasPrecision(18, 2);
                entity.Property(e => e.Description).HasMaxLength(1000);
                entity.Property(e => e.ImageUrl).HasMaxLength(500);
                entity.Property(e => e.Size).HasMaxLength(50);
                entity.Property(e => e.Rating).HasPrecision(3, 1);

                // Relationship with Category
                entity.HasOne(e => e.Category)
                      .WithMany()
                      .HasForeignKey(e => e.CategoryId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Order entity
            modelBuilder.Entity<Order>(entity =>
            {
                var orderStatusConverter = new ValueConverter<Enums.OrderStatus, string>(
                    status => status.ToString(),
                    status => status == "Pending"
                        ? Enums.OrderStatus.PendingApproval
                        : Enum.Parse<Enums.OrderStatus>(status));

                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).UseIdentityColumn();
                entity.Property(e => e.TotalAmount).HasPrecision(18, 2);
                entity.Property(e => e.SubTotalAmount).HasPrecision(18, 2);
                entity.Property(e => e.DiscountAmount).HasPrecision(18, 2);
                entity.Property(e => e.FinalAmount).HasPrecision(18, 2);
                entity.Property(e => e.VoucherCode).HasMaxLength(50);
                entity.Property(e => e.CustomerName).HasMaxLength(100);
                entity.Property(e => e.CustomerPhone).HasMaxLength(20);
                entity.Property(e => e.CustomerEmail).HasMaxLength(100);
                entity.Property(e => e.ShippingAddress).HasMaxLength(500);
                entity.Property(e => e.PaymentMethod).HasMaxLength(50);
                entity.Property(e => e.
                
                
                PaymentStatus).HasMaxLength(50);
                entity.Property(e => e.PaymentTransactionId).HasMaxLength(100);
                entity.Property(e => e.Status).HasConversion(orderStatusConverter);

                // Relationship with OrderDetails
                entity.HasMany(o => o.OrderDetails)
                      .WithOne(od => od.Order)
                      .HasForeignKey(od => od.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure OrderDetail entity
            modelBuilder.Entity<OrderDetail>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).UseIdentityColumn();
                entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
                entity.Property(e => e.ProductName).HasMaxLength(200).IsRequired(false);

                // Relationships
                entity.HasOne(e => e.Order)
                      .WithMany(o => o.OrderDetails)
                      .HasForeignKey(e => e.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Product)
                      .WithMany()
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Seed initial data
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Seed Categories
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Electronics", Description = "Electronic devices and gadgets" },
                new Category { Id = 2, Name = "Clothing", Description = "Apparel and fashion items" },
                new Category { Id = 3, Name = "Books", Description = "Books and publications" },
                new Category { Id = 4, Name = "Home & Garden", Description = "Home and garden products" },
                new Category { Id = 5, Name = "Sports", Description = "Sports equipment and accessories" }
            );

            // Seed Products
            modelBuilder.Entity<Product>().HasData(
                new Product { Id = 1, Name = "Laptop Dell XPS 15", Price = 35000000, Stock = 10,Size="M", Rating= 4.5m, CategoryId = 1, Description = "High-performance laptop", ImageUrl = "" },
                new Product { Id = 2, Name = "iPhone 15 Pro", Price = 28000000, Stock = 15, Size = "L", Rating = 4.6m, CategoryId = 1, Description = "Latest Apple smartphone", ImageUrl = "" },
                new Product { Id = 3, Name = "T-Shirt Cotton", Price = 250000, Stock = 100, Size = "M", Rating = 4.7m, CategoryId = 2, Description = "Comfortable cotton t-shirt", ImageUrl = "" },
                new Product { Id = 4, Name = "Programming Book", Price = 450000, Stock = 50, Size = "M", Rating = 4.2m, CategoryId = 3, Description = "Learn programming basics", ImageUrl = "" },
                new Product { Id = 5, Name = "Garden Tools Set", Price = 850000, Stock = 25, Size = "M", Rating = 4.1m, CategoryId = 4, Description = "Complete gardening toolkit", ImageUrl = "" }
            );

            // Seed Admin User
            byte[] adminSalt;
            string adminHashedPassword = TokenHelper.HashPassword("admin123", out adminSalt);

            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Name = "Administrator",
                    UserName = "admin",
                    Password = adminHashedPassword,
                    Salt = adminSalt,
                    Email = "admin@basecore.com",
                    Phone = "0123456789",
                    Position = "System Administrator",
                    Contact = "System Admin",
                    Image = "",
                    IsActive = true,
                    UserType = 1,
                    Created = DateTime.Now
                }
            );
        }
    }
}
