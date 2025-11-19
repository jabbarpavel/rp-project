// RP.CRM.Api/Program.cs
using Scalar.AspNetCore;
using Microsoft.EntityFrameworkCore;
using RP.CRM.Infrastructure.Data;
using RP.CRM.Application.Interfaces;
using RP.CRM.Application.Services;
using RP.CRM.Infrastructure.Repositories;
using RP.CRM.Infrastructure.Context;
using RP.CRM.Infrastructure.Middleware;
using Microsoft.AspNetCore.Identity;
using RP.CRM.Infrastructure.Entities;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json;
using RP.CRM.Domain.Entities;
using RP.CRM.Infrastructure.Services;


// -----------------------------
// Load tenants.json
// -----------------------------
var tenantFile = Path.Combine(AppContext.BaseDirectory, "tenants.json");
List<Tenant> tenants = new();
List<string> allowedOrigins = new();

if (File.Exists(tenantFile))
{
    tenants = JsonSerializer.Deserialize<List<Tenant>>(File.ReadAllText(tenantFile)) ?? new();

    foreach (var t in tenants)
    {
        var domain = t.Domain.ToLower();
        allowedOrigins.Add($"http://{domain}:4200");
        allowedOrigins.Add($"https://{domain}:4200");
    }

    Console.WriteLine("✅ Loaded tenant domains:");
    foreach (var o in allowedOrigins)
        Console.WriteLine($"   {o}");
}
else
{
    Console.WriteLine("⚠ tenants.json not found — continuing without tenant data");
}

var builder = WebApplication.CreateBuilder(args);

// -----------------------------
// Dynamic Kestrel binding (one shared port for all tenants)
// -----------------------------
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenLocalhost(5015);
    options.ListenAnyIP(5020);
    Console.WriteLine("✅ Bound port 5020 for all tenant hostnames");
});

// -----------------------------
// Services
// -----------------------------
builder.Services.AddScoped<ITenantRepository, TenantRepository>();
builder.Services.AddScoped<TenantContext>();

builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<ICustomerService, CustomerService>();

builder.Services.AddScoped<ITenantService, TenantService>();

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();

builder.Services.AddScoped<IDocumentRepository, DocumentRepository>();
builder.Services.AddScoped<IDocumentService, DocumentService>();

builder.Services.AddScoped<ICustomerTaskRepository, CustomerTaskRepository>();
builder.Services.AddScoped<ICustomerTaskService, CustomerTaskService>();

builder.Services.AddScoped<ICustomerRelationshipRepository, CustomerRelationshipRepository>();
builder.Services.AddScoped<ICustomerRelationshipService, CustomerRelationshipService>();


builder.Services.AddControllers();

// -----------------------------
// Dynamic CORS
// -----------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        if (allowedOrigins.Count == 0)
        {
            Console.WriteLine("⚠ No allowed origins configured from tenants.json");
        }
        else
        {
            Console.WriteLine("✅ CORS allowed origins:");
            foreach (var o in allowedOrigins)
                Console.WriteLine($"   {o}");
        }

        policy.WithOrigins(allowedOrigins.ToArray())
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// -----------------------------
// DB
// -----------------------------
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Host=localhost;Database=kynso_prod;Username=postgres;Password=admin123";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// -----------------------------
// JWT + Identity
// -----------------------------
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? "your_super_secret_key_here_your_super_secret_key_here";

builder.Services.AddIdentityCore<ApplicationUser>(options =>
{
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
})
.AddRoles<IdentityRole<int>>()
.AddEntityFrameworkStores<AppDbContext>();

builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// -----------------------------
// Tenant Seeding (auto create if missing)
// -----------------------------
using (var scope = app.Services.CreateScope())
{
    var ctx = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    foreach (var t in tenants)
    {
        var existing = ctx.Tenants.FirstOrDefault(x => x.Domain.ToLower() == t.Domain.ToLower());
        if (existing == null)
        {
            ctx.Tenants.Add(new Tenant
            {
                Name = t.Name,
                Domain = t.Domain,
                CreatedAt = DateTime.UtcNow
            });
        }
    }
    ctx.SaveChanges();
}

// -----------------------------
// Pipeline
// -----------------------------
if (app.Environment.IsDevelopment())
{
    app.MapScalarApiReference();
}

// app.UseHttpsRedirection(); // lokal nicht nötig

app.UseCors("AllowFrontend");
app.UseMiddleware<ErrorHandlingMiddleware>();

app.UseAuthentication();
app.UseMiddleware<TenantMiddleware>();
app.UseAuthorization();

app.MapControllers();

app.Run();
