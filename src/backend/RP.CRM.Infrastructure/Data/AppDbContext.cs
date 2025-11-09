using Microsoft.EntityFrameworkCore;
using RP.CRM.Infrastructure.Context;
using RP.CRM.Domain.Entities;

namespace RP.CRM.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        private readonly TenantContext _tenantContext;

        public AppDbContext(DbContextOptions<AppDbContext> options, TenantContext tenantContext)
            : base(options)
        {
            _tenantContext = tenantContext;
        }

        public DbSet<Customer> Customers => Set<Customer>();
        public DbSet<Tenant> Tenants => Set<Tenant>();
        public DbSet<User> Users => Set<User>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Customer>()
                .HasOne(c => c.Tenant)
                .WithMany(t => t.Customers)
                .HasForeignKey(c => c.TenantId);

            modelBuilder.Entity<User>()
                .HasOne(u => u.Tenant)
                .WithMany(t => t.Users)
                .HasForeignKey(u => u.TenantId);

            // Seed Beispiel
            modelBuilder.Entity<Tenant>().HasData(
                new Tenant 
                { 
                    Id = 1, 
                    Name = "Finaro", 
                    Domain = "finaro", 
                    CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) 
                }
            );
        }

        public override int SaveChanges()
        {
            ApplyTenantId();
            ApplyAuditFields();
            return base.SaveChanges();
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            ApplyTenantId();
            ApplyAuditFields();
            return await base.SaveChangesAsync(cancellationToken);
        }

        private void ApplyTenantId()
        {
            foreach (var entry in ChangeTracker.Entries<Customer>())
            {
                if (entry.State == EntityState.Added && entry.Entity.TenantId == 0)
                    entry.Entity.TenantId = _tenantContext.TenantId;
            }

            foreach (var entry in ChangeTracker.Entries<User>())
            {
                if (entry.State == EntityState.Added && entry.Entity.TenantId == 0)
                    entry.Entity.TenantId = _tenantContext.TenantId;
            }
        }

        private void ApplyAuditFields()
        {
            var entries = ChangeTracker.Entries<BaseEntity>();

            foreach (var entry in entries)
            {
                if (entry.State == EntityState.Added)
                    entry.Entity.CreatedAt = DateTime.UtcNow;

                if (entry.State == EntityState.Modified)
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
            }
        }
    }
}
