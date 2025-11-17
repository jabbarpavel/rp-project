using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace RP.CRM.Domain.Entities
{
    public class Document : BaseEntity
    {
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string? Category { get; set; } // Police, ID/Pass, Sonstige
        
        public int CustomerId { get; set; }
        public int UploadedByUserId { get; set; }
        public int TenantId { get; set; }

        // Navigation properties
        [ForeignKey(nameof(CustomerId))]
        public Customer? Customer { get; set; }

        [ForeignKey(nameof(UploadedByUserId))]
        public User? UploadedBy { get; set; }

        [ForeignKey(nameof(TenantId))]
        public Tenant? Tenant { get; set; }
    }
}
