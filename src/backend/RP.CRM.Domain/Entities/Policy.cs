using System;
using System.ComponentModel.DataAnnotations.Schema;
using RP.CRM.Domain.Enums;

namespace RP.CRM.Domain.Entities
{
    public class Policy : BaseEntity
    {
        public string PolicyNumber { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? OrganizationalUnit { get; set; }
        public PolicyStatus Status { get; set; } = PolicyStatus.Active;

        public int CustomerId { get; set; }
        public int? AdvisorUserId { get; set; }
        public int CreatedByUserId { get; set; }
        public int TenantId { get; set; }

        // Single attached document (PDF / image) per policy.
        public string? DocumentFileName { get; set; }
        public string? DocumentFilePath { get; set; }
        public string? DocumentContentType { get; set; }
        public long? DocumentFileSize { get; set; }

        // Soft delete (analogous to CustomerNote)
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public int? DeletedByUserId { get; set; }

        // Navigation properties
        [ForeignKey(nameof(CustomerId))]
        public Customer? Customer { get; set; }

        [ForeignKey(nameof(AdvisorUserId))]
        public User? Advisor { get; set; }

        [ForeignKey(nameof(CreatedByUserId))]
        public User? CreatedByUser { get; set; }

        [ForeignKey(nameof(DeletedByUserId))]
        public User? DeletedByUser { get; set; }

        [ForeignKey(nameof(TenantId))]
        public Tenant? Tenant { get; set; }
    }
}
