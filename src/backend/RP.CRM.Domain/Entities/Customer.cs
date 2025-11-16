using System;                      // optional, aber üblich
using RP.CRM.Domain.Entities;      // falls BaseEntity in demselben Namespace bleibt (redundant, aber sicher)
namespace RP.CRM.Domain.Entities
{
    public class Customer : BaseEntity
    {
        public string FirstName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string AHVNum { get; set; } = string.Empty;

        public int TenantId { get; set; }
        public Tenant? Tenant { get; set; }

        // neu
        public int? AdvisorId { get; set; }
        public User? Advisor { get; set; }

        public bool IsDeleted { get; set; }
    }
}
