using Microsoft.EntityFrameworkCore;
using RP.CRM.Infrastructure.Context;
using RP.CRM.Domain.Entities;
using RP.CRM.Domain.Enums;

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
        public DbSet<Document> Documents => Set<Document>();
        public DbSet<CustomerTask> CustomerTasks => Set<CustomerTask>();
        public DbSet<CustomerRelationship> CustomerRelationships => Set<CustomerRelationship>();
        public DbSet<CustomerNote> CustomerNotes => Set<CustomerNote>();
        public DbSet<CustomerNoteHistory> CustomerNoteHistories => Set<CustomerNoteHistory>();
        public DbSet<Policy> Policies => Set<Policy>();

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

                entity.Property(u => u.Permissions)
                    .HasDefaultValue((int)Permission.User);
            });

            // ====== Document-Konfiguration ======
            modelBuilder.Entity<Document>(entity =>
            {
                entity.HasOne(d => d.Customer)
                    .WithMany()
                    .HasForeignKey(d => d.CustomerId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(d => d.UploadedBy)
                    .WithMany()
                    .HasForeignKey(d => d.UploadedByUserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(d => d.Tenant)
                    .WithMany()
                    .HasForeignKey(d => d.TenantId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(d => new { d.TenantId, d.CustomerId });
            });

            // ====== Task-Konfiguration ======
            modelBuilder.Entity<CustomerTask>(entity =>
            {
                entity.HasOne(t => t.Customer)
                    .WithMany()
                    .HasForeignKey(t => t.CustomerId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(t => t.AssignedToUser)
                    .WithMany()
                    .HasForeignKey(t => t.AssignedToUserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(t => t.Tenant)
                    .WithMany()
                    .HasForeignKey(t => t.TenantId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(t => new { t.TenantId, t.AssignedToUserId, t.Status });
                entity.HasIndex(t => new { t.TenantId, t.CustomerId });
            });

            // ====== CustomerRelationship-Konfiguration ======
            modelBuilder.Entity<CustomerRelationship>(entity =>
            {
                entity.HasOne(r => r.Customer)
                    .WithMany()
                    .HasForeignKey(r => r.CustomerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(r => r.RelatedCustomer)
                    .WithMany()
                    .HasForeignKey(r => r.RelatedCustomerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(r => r.Tenant)
                    .WithMany()
                    .HasForeignKey(r => r.TenantId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(r => new { r.TenantId, r.CustomerId });
                entity.HasIndex(r => new { r.TenantId, r.RelatedCustomerId });
                entity.HasIndex(r => new { r.CustomerId, r.RelatedCustomerId });
            });

            // ====== CustomerNote-Konfiguration ======
            modelBuilder.Entity<CustomerNote>(entity =>
            {
                entity.Property(n => n.Text)
                    .IsRequired();

                entity.Property(n => n.IsDeleted)
                    .HasDefaultValue(false);

                entity.HasOne(n => n.Customer)
                    .WithMany()
                    .HasForeignKey(n => n.CustomerId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(n => n.CreatedByUser)
                    .WithMany()
                    .HasForeignKey(n => n.CreatedByUserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(n => n.UpdatedByUser)
                    .WithMany()
                    .HasForeignKey(n => n.UpdatedByUserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(n => n.DeletedByUser)
                    .WithMany()
                    .HasForeignKey(n => n.DeletedByUserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(n => n.Tenant)
                    .WithMany()
                    .HasForeignKey(n => n.TenantId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(n => new { n.TenantId, n.CustomerId, n.CreatedAt });
                entity.HasIndex(n => n.IsDeleted);
            });

            // ====== CustomerNoteHistory-Konfiguration ======
            modelBuilder.Entity<CustomerNoteHistory>(entity =>
            {
                entity.Property(h => h.Text)
                    .IsRequired();

                entity.HasOne(h => h.CustomerNote)
                    .WithMany(n => n.History)
                    .HasForeignKey(h => h.CustomerNoteId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(h => h.EditedByUser)
                    .WithMany()
                    .HasForeignKey(h => h.EditedByUserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(h => h.Tenant)
                    .WithMany()
                    .HasForeignKey(h => h.TenantId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(h => new { h.TenantId, h.CustomerNoteId, h.EditedAt });
            });

            // ====== Policy-Konfiguration ======
            modelBuilder.Entity<Policy>(entity =>
            {
                entity.Property(p => p.PolicyNumber)
                    .HasMaxLength(100)
                    .IsRequired();

                entity.Property(p => p.Type)
                    .HasMaxLength(100)
                    .IsRequired();

                entity.Property(p => p.Company)
                    .HasMaxLength(200)
                    .IsRequired();

                entity.Property(p => p.OrganizationalUnit)
                    .HasMaxLength(150)
                    .IsRequired(false);

                entity.Property(p => p.DocumentFileName).HasMaxLength(255);
                entity.Property(p => p.DocumentContentType).HasMaxLength(150);

                entity.Property(p => p.IsDeleted).HasDefaultValue(false);

                entity.HasOne(p => p.Customer)
                    .WithMany()
                    .HasForeignKey(p => p.CustomerId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(p => p.Advisor)
                    .WithMany()
                    .HasForeignKey(p => p.AdvisorUserId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(p => p.CreatedByUser)
                    .WithMany()
                    .HasForeignKey(p => p.CreatedByUserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.DeletedByUser)
                    .WithMany()
                    .HasForeignKey(p => p.DeletedByUserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.Tenant)
                    .WithMany()
                    .HasForeignKey(p => p.TenantId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(p => new { p.TenantId, p.CustomerId, p.StartDate });
                entity.HasIndex(p => p.IsDeleted);
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

            foreach (var entry in ChangeTracker.Entries<Document>())
            {
                if (entry.State == EntityState.Added && entry.Entity.TenantId == 0)
                    entry.Entity.TenantId = _tenantContext.TenantId;
            }

            foreach (var entry in ChangeTracker.Entries<CustomerTask>())
            {
                if (entry.State == EntityState.Added && entry.Entity.TenantId == 0)
                    entry.Entity.TenantId = _tenantContext.TenantId;
            }

            foreach (var entry in ChangeTracker.Entries<CustomerRelationship>())
            {
                if (entry.State == EntityState.Added && entry.Entity.TenantId == 0)
                    entry.Entity.TenantId = _tenantContext.TenantId;
            }

            foreach (var entry in ChangeTracker.Entries<CustomerNote>())
            {
                if (entry.State == EntityState.Added && entry.Entity.TenantId == 0)
                    entry.Entity.TenantId = _tenantContext.TenantId;
            }

            foreach (var entry in ChangeTracker.Entries<CustomerNoteHistory>())
            {
                if (entry.State == EntityState.Added && entry.Entity.TenantId == 0)
                    entry.Entity.TenantId = _tenantContext.TenantId;
            }

            foreach (var entry in ChangeTracker.Entries<Policy>())
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
