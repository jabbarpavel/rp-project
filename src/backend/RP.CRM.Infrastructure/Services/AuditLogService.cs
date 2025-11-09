using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using RP.CRM.Application.Interfaces;
using RP.CRM.Domain.Entities;
using RP.CRM.Infrastructure.Data;
using RP.CRM.Infrastructure.Context;

namespace RP.CRM.Infrastructure.Services
{
    public class AuditLogService : IAuditLogService
    {
        private readonly AppDbContext _context;
        private readonly TenantContext _tenantContext;
        private readonly ILogger<AuditLogService> _logger;

        public AuditLogService(AppDbContext context, TenantContext tenantContext, ILogger<AuditLogService> logger)
        {
            _context = context;
            _tenantContext = tenantContext;
            _logger = logger;
        }

        public async Task LogAsync(ChangeLog log)
        {
            log.TenantId = _tenantContext.TenantId;
            log.ChangedAt = DateTime.UtcNow;

            _context.ChangeLogs.Add(log);
            await _context.SaveChangesAsync();

            _logger.LogInformation("ChangeLog gespeichert: {Entity} {Action} {EntityId}", log.EntityName, log.Action, log.EntityId);
        }

        public async Task CaptureEntityChangesAsync(DbContext dbContext, string changedBy = "system")
        {
            var entries = dbContext.ChangeTracker.Entries()
                .Where(e => e.State == EntityState.Modified || e.State == EntityState.Deleted || e.State == EntityState.Added)
                .ToList();

            foreach (var entry in entries)
            {
                var entityName = entry.Entity.GetType().Name;
                var entityId = entry.Property("Id").CurrentValue;

                string? oldJson = null;
                string? newJson = null;
                string action;

                if (entry.State == EntityState.Added)
                {
                    newJson = JsonSerializer.Serialize(entry.CurrentValues.ToObject());
                    action = "Created";
                }
                else if (entry.State == EntityState.Modified)
                {
                    // Prüfe, ob es sich um ein Soft Delete handelt
                    var isDeletedProp = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "IsDeleted");
                    if (isDeletedProp != null &&
                        isDeletedProp.OriginalValue is bool oldDel &&
                        isDeletedProp.CurrentValue is bool newDel &&
                        !oldDel && newDel)
                    {
                        action = "Deleted";
                    }
                    else
                    {
                        action = "Updated";
                    }

                    oldJson = JsonSerializer.Serialize(entry.OriginalValues.ToObject());
                    newJson = JsonSerializer.Serialize(entry.CurrentValues.ToObject());
                }
                else if (entry.State == EntityState.Deleted)
                {
                    oldJson = JsonSerializer.Serialize(entry.OriginalValues.ToObject());
                    action = "Deleted";
                }
                else
                {
                    continue;
                }

                var log = new ChangeLog
                {
                    EntityName = entityName,
                    EntityId = Convert.ToInt32(entityId),
                    Action = action,
                    ChangedBy = changedBy,
                    ChangedAt = DateTime.UtcNow,
                    OldValues = oldJson,
                    NewValues = newJson,
                    TenantId = _tenantContext.TenantId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.ChangeLogs.Add(log);
            }

            await _context.SaveChangesAsync();
        }
    }
}
