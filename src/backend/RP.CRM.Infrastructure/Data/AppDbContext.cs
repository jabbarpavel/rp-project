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
        public DbSet<ChangeLog> ChangeLogs => Set<ChangeLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ====== Tenant-Kunde-Beziehung ======
            modelBuilder.Entity<Customer>()
                .HasOne(c => c.Tenant)
                .WithMany(t => t.Customers)
                .HasForeignKey(c => c.TenantId);

            // ====== Tenant-User-Beziehung ======
            modelBuilder.Entity<User>()
                .HasOne(u => u.Tenant)
                .WithMany(t => t.Users)
                .HasForeignKey(u => u.TenantId);

            // ====== Advisor-Beziehung ======
            modelBuilder.Entity<Customer>()
                .HasOne(c => c.Advisor)
                .WithMany()
                .HasForeignKey(c => c.AdvisorId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Customer>()
                .HasIndex(c => new { c.TenantId, c.AdvisorId });

            // ====== User-Konfiguration (neue Felder) ======
            modelBuilder.Entity<User>(entity =>
            {
                entity.Property(u => u.FirstName)
                    .HasMaxLength(100)
                    .IsRequired(false);

                entity.Property(u => u.Name)
                    .HasMaxLength(100)
                    .IsRequired(false);

                entity.Property(u => u.Phone)
                    .HasMaxLength(50)
                    .IsRequired(false);

                entity.Property(u => u.IsActive)
                    .HasDefaultValue(true);
            });

            // ====== Seed-Daten ======
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
