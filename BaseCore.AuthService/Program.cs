using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using BaseCore.Repository;
using BaseCore.Repository.EFCore;
using BaseCore.Services.Authen;
using BaseCore.Common;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
builder.Services.AddEndpointsApiExplorer();

// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "BaseCore Auth Service API",
        Version = "v1",
        Description = "Authentication Microservice - Login, Register, User Management (Bài 10, 11)"
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter JWT token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type=ReferenceType.SecurityScheme,
                    Id="Bearer"
                }
            },
            new string[]{}
        }
    });
});

// SQL Server Configuration
builder.Services.AddDbContext<MySqlDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("SQLServer"));
});

// DI for Authentication Services and Repositories only
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserRepositoryEF, UserRepositoryEF>();

// JWT Authentication Key
var key = Encoding.ASCII.GetBytes(builder.Configuration["Jwt:SecretKey"] ?? "YourSecretKeyForAuthenticationShouldBeLongEnough");
builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

var app = builder.Build();

// Seed MongoDB data
// Seed SQL Server data
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<MySqlDbContext>();
    dbContext.Database.Migrate();

    // Ensure the default admin account always exists.
    // This lets the system recover if the admin user is deleted manually.
    byte[] adminSalt;
    string adminHashedPassword = TokenHelper.HashPassword("admin123", out adminSalt);

    var adminUser = dbContext.Users.FirstOrDefault(u =>
        u.UserName == "admin" || u.Email == "admin@basecore.com");

    if (adminUser == null)
    {
        dbContext.Users.Add(new BaseCore.Entities.User
        {
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
        });
    }
    else
    {
        adminUser.Name = "Administrator";
        adminUser.UserName = "admin";
        adminUser.Password = adminHashedPassword;
        adminUser.Salt = adminSalt;
        adminUser.Email = "admin@basecore.com";
        adminUser.Phone = "0123456789";
        adminUser.Position = "System Administrator";
        adminUser.Contact = "System Admin";
        adminUser.Image = "";
        adminUser.IsActive = true;
        adminUser.UserType = 1;
    }

    if (!dbContext.Users.Any(u => u.UserName == "user" || u.Email == "user@basecore.com"))
    {
        byte[] userSalt;
        string userHashedPassword = TokenHelper.HashPassword("user123", out userSalt);

        dbContext.Users.Add(new BaseCore.Entities.User
        {
            Name = "Regular User",
            UserName = "user",
            Password = userHashedPassword,
            Salt = userSalt,
            Email = "user@basecore.com",
            Phone = "0987654321",
            Position = "User",
            Contact = "Regular User",
            Image = "",
            IsActive = true,
            UserType = 0,
            Created = DateTime.Now
        });
    }

    dbContext.SaveChanges();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

Console.WriteLine("BaseCore Auth Service running on port 5002");
Console.WriteLine("Endpoints: /api/auth, /api/users, /api/roles");
app.Run();
