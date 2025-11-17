using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace RP.CRM.Domain.Entities
{
    public class CustomerTask : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string Status { get; set; } = "offen"; // "offen" or "erledigt"
        public DateTime? DueDate { get; set; }
        
        public int CustomerId { get; set; }
        public int AssignedToUserId { get; set; }
        public int TenantId { get; set; }

        // Navigation properties
        [ForeignKey(nameof(CustomerId))]
        public Customer? Customer { get; set; }

        [ForeignKey(nameof(AssignedToUserId))]
        public User? AssignedToUser { get; set; }

        [ForeignKey(nameof(TenantId))]
        public Tenant? Tenant { get; set; }
    }
}
