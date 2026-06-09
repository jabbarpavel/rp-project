using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace RP.CRM.Domain.Entities
{
    public class CustomerNote : BaseEntity
    {
        public string Text { get; set; } = string.Empty;

        public int CustomerId { get; set; }
        public int CreatedByUserId { get; set; }
        public int TenantId { get; set; }

        // Edit metadata
        public int? UpdatedByUserId { get; set; }

        // Soft delete
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public int? DeletedByUserId { get; set; }

        // Navigation properties
        [ForeignKey(nameof(CustomerId))]
        public Customer? Customer { get; set; }

        [ForeignKey(nameof(CreatedByUserId))]
        public User? CreatedByUser { get; set; }

        [ForeignKey(nameof(UpdatedByUserId))]
        public User? UpdatedByUser { get; set; }

        [ForeignKey(nameof(DeletedByUserId))]
        public User? DeletedByUser { get; set; }

        [ForeignKey(nameof(TenantId))]
        public Tenant? Tenant { get; set; }

        public ICollection<CustomerNoteHistory> History { get; set; } = new List<CustomerNoteHistory>();
    }
}
