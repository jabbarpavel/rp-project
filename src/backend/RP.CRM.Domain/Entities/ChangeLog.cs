using System;

namespace RP.CRM.Domain.Entities
{
    public class ChangeLog : BaseEntity
    {
        public int Id { get; set; }

        public string EntityName { get; set; } = string.Empty;   // z.B. "Customer"
        public int EntityId { get; set; }                        // betroffener Datensatz

        public string Action { get; set; } = string.Empty;       // Created, Updated, Deleted
        public string ChangedBy { get; set; } = string.Empty;    // E-Mail oder UserId
        public DateTime ChangedAt { get; set; }                  // UTC

        public string? OldValues { get; set; }                   // JSON
        public string? NewValues { get; set; }                   // JSON

        public int TenantId { get; set; }
    }
}
