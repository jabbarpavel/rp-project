using System;
using System.ComponentModel.DataAnnotations.Schema;
using RP.CRM.Domain.Enums;

namespace RP.CRM.Domain.Entities
{
    public class Policy : BaseEntity
    {
        public string PolicyNumber { get; set; } = string.Empty;
        public PolicyType Type { get; set; }
        public string Company { get; set; } = string.Empty;
        public string OrganizationalUnit { get; set; } = string.Empty; // Eigenverwaltete/Fremdverwaltete Verträge
        public string? ProductName { get; set; }
        public MutationReason? MutationReason { get; set; }
        public string? CustomerNumber { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public PaymentFrequency? PaymentFrequency { get; set; }
        public decimal? AnnualPremium { get; set; }
        public string? Advisor { get; set; }
        public string? Status { get; set; }
        
        // Document reference (optional)
        public int? DocumentId { get; set; }
        
        public int CustomerId { get; set; }
        public int TenantId { get; set; }

        // Navigation properties
        [ForeignKey(nameof(CustomerId))]
        public Customer? Customer { get; set; }

        [ForeignKey(nameof(DocumentId))]
        public Document? Document { get; set; }

        [ForeignKey(nameof(TenantId))]
        public Tenant? Tenant { get; set; }
    }
}
