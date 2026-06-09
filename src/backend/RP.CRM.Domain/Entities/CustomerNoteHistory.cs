using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace RP.CRM.Domain.Entities
{
    /// <summary>
    /// Snapshot of a previous version of a <see cref="CustomerNote"/>.
    /// Created whenever a note is edited (the previous text is archived here).
    /// </summary>
    public class CustomerNoteHistory : BaseEntity
    {
        public int CustomerNoteId { get; set; }

        /// <summary>Previous (replaced) text content.</summary>
        public string Text { get; set; } = string.Empty;

        /// <summary>User who performed the edit that replaced this version.</summary>
        public int EditedByUserId { get; set; }

        /// <summary>Timestamp of the edit that replaced this version.</summary>
        public DateTime EditedAt { get; set; }

        public int TenantId { get; set; }

        [ForeignKey(nameof(CustomerNoteId))]
        public CustomerNote? CustomerNote { get; set; }

        [ForeignKey(nameof(EditedByUserId))]
        public User? EditedByUser { get; set; }

        [ForeignKey(nameof(TenantId))]
        public Tenant? Tenant { get; set; }
    }
}
