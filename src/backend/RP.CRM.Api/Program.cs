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


var builder = WebApplication.CreateBuilder(args);

// -----------------------------
// Startup Diagnostic Information
// -----------------------------
Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
Console.WriteLine("🚀 Kynso CRM API - Starting Up");
Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
Console.WriteLine($"⏰ Timestamp: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
Console.WriteLine($"🖥️  Hostname: {System.Environment.MachineName}");
Console.WriteLine($"📁 Base Directory: {AppContext.BaseDirectory}");

// -----------------------------
// Load environment-specific tenants.json
// -----------------------------
var environment = builder.Environment.EnvironmentName;
Console.WriteLine($"🌍 Environment: {environment}");
var tenantFile = Path.Combine(AppContext.BaseDirectory, $"tenants.{environment}.json");

List<Tenant> tenants = new();
List<string> allowedOrigins = new();

if (File.Exists(tenantFile))
{
    tenants = JsonSerializer.Deserialize<List<Tenant>>(File.ReadAllText(tenantFile)) ?? new();

    foreach (var t in tenants)
    {
        var domain = t.Domain.ToLower();
        
        // For localhost domain, allow standard port configurations
        if (domain == "localhost")
        {
            // Development ports
            allowedOrigins.Add($"http://localhost:4200");
            allowedOrigins.Add($"http://localhost:5015");
            allowedOrigins.Add($"http://127.0.0.1:4200");
            
            // Test environment ports
            if (environment == "Test")
            {
                allowedOrigins.Add($"http://localhost:4300");
                allowedOrigins.Add($"http://localhost:5016");
                allowedOrigins.Add($"http://127.0.0.1:4300");
            }
        }
        else
        {
            allowedOrigins.Add($"http://{domain}:4200");
            allowedOrigins.Add($"https://{domain}:4200");
        }
    }

    Console.WriteLine($"✅ Loaded tenant domains from {Path.GetFileName(tenantFile)} ({environment}):");
    foreach (var o in allowedOrigins)
        Console.WriteLine($"   {o}");
}
else
{
    Console.WriteLine($"❌ ERROR: Tenant configuration file not found!");
    Console.WriteLine($"   Expected file: {Path.GetFileName(tenantFile)}");
    Console.WriteLine($"   Full path: {tenantFile}");
    Console.WriteLine($"   The file should be in the same directory as the application executable.");
    throw new FileNotFoundException($"Required tenant configuration file not found: {Path.GetFileName(tenantFile)}");
}

// -----------------------------
// Dynamic Kestrel binding (one shared port for all tenants)
// Only apply custom port configuration if ASPNETCORE_URLS is not set
// (Docker/Production environments set ASPNETCORE_URLS=http://+:5000)
// -----------------------------
Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
Console.WriteLine("🔌 Port Configuration");
Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
var aspnetcoreUrls = builder.Configuration["ASPNETCORE_URLS"];
if (string.IsNullOrEmpty(aspnetcoreUrls))
{
    // Local development/test - use custom ports
    builder.WebHost.ConfigureKestrel(options =>
    {
        if (environment == "Test")
        {
            options.ListenLocalhost(5016);
            options.ListenAnyIP(5021);
            Console.WriteLine("✅ Test environment: Bound ports 5016 (localhost) and 5021 (all IPs)");
        }
        else
        {
            options.ListenLocalhost(5015);
            options.ListenAnyIP(5020);
            Console.WriteLine("✅ Development: Bound ports 5015 (localhost) and 5020 (all IPs)");
        }
    });
}
else
{
    // Docker/Production - use ASPNETCORE_URLS environment variable
    Console.WriteLine($"✅ Using ASPNETCORE_URLS: {aspnetcoreUrls}");
    Console.WriteLine($"   This typically means we're running in Docker/Production");
    Console.WriteLine($"   Backend will listen on port 5000 (all interfaces)");
}

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
            // Allow localhost as fallback for development
            if (builder.Environment.IsDevelopment())
            {
                policy.WithOrigins("http://localhost:4200", "http://localhost:5015", "http://127.0.0.1:4200")
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
                Console.WriteLine("⚠ Using fallback localhost origins for development");
            }
        }
        else
        {
            Console.WriteLine($"✅ CORS allowed origins ({builder.Environment.EnvironmentName}):");
            foreach (var o in allowedOrigins)
                Console.WriteLine($"   {o}");
            
            policy.WithOrigins(allowedOrigins.ToArray())
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// -----------------------------
// DB
// -----------------------------
Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
Console.WriteLine("🗄️  Database Configuration");
Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Host=localhost;Database=kynso_dev;Username=postgres;Password=admin123";

// Log sanitized connection string (hide password)
var sanitizedConnection = System.Text.RegularExpressions.Regex.Replace(
    connectionString, 
    @"Password=([^;]+)", 
    "Password=***");
Console.WriteLine($"📝 Connection: {sanitizedConnection}");

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
// Apply Database Migrations on Startup
// -----------------------------
Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
Console.WriteLine("📊 Database Migration");
Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
using (var scope = app.Services.CreateScope())
{
    var ctx = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        Console.WriteLine("🔄 Testing database connection...");
        var canConnect = await ctx.Database.CanConnectAsync();
        if (canConnect)
        {
            Console.WriteLine("✅ Database connection successful");
        }
        else
        {
            Console.WriteLine("❌ Cannot connect to database");
            throw new Exception("Database connection failed");
        }
        
        Console.WriteLine("🔄 Applying database migrations...");
        ctx.Database.Migrate();
        Console.WriteLine("✅ Database migrations applied successfully!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Database error: {ex.Message}");
        Console.WriteLine($"   Stack trace: {ex.StackTrace}");
        throw;
    }
}

// -----------------------------
// Tenant Seeding (auto create if missing)
// -----------------------------
Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
Console.WriteLine("🏢 Tenant Seeding");
Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
using (var scope = app.Services.CreateScope())
{
    var ctx = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var tenantsCreated = 0;
    var tenantsExisting = 0;
    
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
            Console.WriteLine($"✅ Creating tenant: {t.Name} ({t.Domain})");
            tenantsCreated++;
        }
        else
        {
            Console.WriteLine($"   Tenant already exists: {t.Name} ({t.Domain})");
            tenantsExisting++;
        }
    }
    
    if (tenantsCreated > 0)
    {
        ctx.SaveChanges();
        Console.WriteLine($"✅ Created {tenantsCreated} new tenant(s)");
    }
    
    if (tenantsExisting > 0)
    {
        Console.WriteLine($"   {tenantsExisting} tenant(s) already existed");
    }
    
    if (tenantsCreated == 0 && tenantsExisting == 0)
    {
        Console.WriteLine("⚠️  No tenants configured in tenants.json");
    }
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

Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
Console.WriteLine("✅ Application Ready!");
Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

// Display accessible URLs based on configuration
if (!string.IsNullOrEmpty(aspnetcoreUrls))
{
    Console.WriteLine("🌐 API is accessible at:");
    Console.WriteLine("   - Health Check: http://localhost:5000/api/health");
    Console.WriteLine("   - User Registration: http://localhost:5000/api/user/register");
    Console.WriteLine("   - User Login: http://localhost:5000/api/user/login");
    if (tenants.Any())
    {
        Console.WriteLine("");
        Console.WriteLine("🏢 Configured Tenants:");
        foreach (var t in tenants)
        {
            if (t.Domain != "localhost")
            {
                Console.WriteLine($"   - {t.Name}: https://{t.Domain}");
            }
        }
    }
}
else
{
    if (environment == "Test")
    {
        Console.WriteLine("🌐 API is accessible at:");
        Console.WriteLine("   - http://localhost:5016 (localhost only)");
        Console.WriteLine("   - http://<your-ip>:5021 (all interfaces)");
    }
    else
    {
        Console.WriteLine("🌐 API is accessible at:");
        Console.WriteLine("   - http://localhost:5015 (localhost only)");
        Console.WriteLine("   - http://<your-ip>:5020 (all interfaces)");
    }
}

Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
Console.WriteLine("");

app.Run();
