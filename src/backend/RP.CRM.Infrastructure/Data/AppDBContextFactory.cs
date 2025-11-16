using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using RP.CRM.Infrastructure.Context;

namespace RP.CRM.Infrastructure.Data
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            optionsBuilder.UseNpgsql("Host=localhost;Database=rp_crm;Username=postgres;Password=admin123");

            // TenantContext für Migrationszwecke (fester Tenant reicht)
            var tenantContext = new TenantContext();
            tenantContext.SetTenant(1);

            return new AppDbContext(optionsBuilder.Options, tenantContext);
        }
    }
}
