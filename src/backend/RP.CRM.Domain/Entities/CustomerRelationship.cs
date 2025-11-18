using System;

namespace RP.CRM.Domain.Entities
{
    public class CustomerRelationship : BaseEntity
    {
        public int CustomerId { get; set; }
        public Customer? Customer { get; set; }

        public int RelatedCustomerId { get; set; }
        public Customer? RelatedCustomer { get; set; }

        // Relationship type: Ehepartner, Eltern, Kind, Geschwister, GleicherHaushalt
        public string RelationshipType { get; set; } = string.Empty;

        // Flag indicating if this customer is a primary contact in this relationship
        public bool IsPrimaryContact { get; set; }

        public int TenantId { get; set; }
        public Tenant? Tenant { get; set; }
    }
}
