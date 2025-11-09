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

            // entkoppelter TenantContext, keine Repositories mehr hier
            var tenantContext = new TenantContext();
            tenantContext.SetTenant(1); // für Migrationen reicht ein fixer Tenant

            return new AppDbContext(optionsBuilder.Options, tenantContext);
        }
    }
}
