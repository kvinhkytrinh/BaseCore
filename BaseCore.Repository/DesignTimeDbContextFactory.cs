using System;
using System.IO;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace BaseCore.Repository
{
    public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<MySqlDbContext>
    {
        public MySqlDbContext CreateDbContext(string[] args)
        {
            var connectionString = Environment.GetEnvironmentVariable("BASECORE_SQLSERVER_CONNECTIONSTRING")
                                   ?? GetConnectionStringFromApiService()
                                   ?? "Data Source=.;Initial Catalog=BaseCoreSales;Integrated Security=True;Trust Server Certificate=True";

            var optionsBuilder = new DbContextOptionsBuilder<MySqlDbContext>();
            optionsBuilder.UseSqlServer(connectionString);

            return new MySqlDbContext(optionsBuilder.Options);
        }

        private static string? GetConnectionStringFromApiService()
        {
            try
            {
                var basePath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "BaseCore.APIService"));
                var appSettingsFile = Path.Combine(basePath, "appsettings.json");
                if (!File.Exists(appSettingsFile))
                {
                    return null;
                }

                using var stream = File.OpenRead(appSettingsFile);
                using var document = JsonDocument.Parse(stream);
                if (document.RootElement.TryGetProperty("ConnectionStrings", out var connectionStrings) &&
                    connectionStrings.TryGetProperty("SQLServer", out var sqlServerConnectionString))
                {
                    return sqlServerConnectionString.GetString();
                }
            }
            catch
            {
                // Ignore and fallback to default if config file is missing or invalid.
            }

            return null;
        }
    }
}
