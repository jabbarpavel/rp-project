using System;                      // optional, aber üblich
using RP.CRM.Domain.Entities;

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

        public int? AdvisorId { get; set; }
        public User? Advisor { get; set; }

        public bool IsDeleted { get; set; }
        public bool IsPrimaryContact { get; set; } = true; // Default true for standalone customers

        public string? CivilStatus { get; set; }
        public string? Religion { get; set; }
        public string? Gender { get; set; }
        public string? Salutation { get; set; }
        public DateOnly? BirthDate { get; set; }
        public string? Profession { get; set; }
        public string? Language { get; set; }
    }
}
