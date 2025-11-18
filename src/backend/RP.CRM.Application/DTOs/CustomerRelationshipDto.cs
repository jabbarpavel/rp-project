using System;

namespace RP.CRM.Application.DTOs
{
    public class CustomerRelationshipDto
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public string? CustomerFirstName { get; set; }
        public string? CustomerLastName { get; set; }
        public int RelatedCustomerId { get; set; }
        public string? RelatedCustomerFirstName { get; set; }
        public string? RelatedCustomerLastName { get; set; }
        public string RelationshipType { get; set; } = string.Empty;
        public bool IsPrimaryContact { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateCustomerRelationshipDto
    {
        public int RelatedCustomerId { get; set; }
        public string RelationshipType { get; set; } = string.Empty;
        public bool IsPrimaryContact { get; set; }
    }
}
