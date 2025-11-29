using System;                      // optional, aber üblich
using RP.CRM.Domain.Entities;
using RP.CRM.Domain.Enums;

namespace RP.CRM.Domain.Entities
{
    public class Customer : BaseEntity
    {
        // Customer Type (Privatperson or Organisation)
        public CustomerType CustomerType { get; set; } = CustomerType.Privatperson;

        // Shared fields for both types
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

        // Privatperson fields
        public string? CivilStatus { get; set; }
        public string? Religion { get; set; }
        public string? Gender { get; set; }
        public string? Salutation { get; set; }
        public DateOnly? BirthDate { get; set; }
        public string? Profession { get; set; }
        public string? Language { get; set; }

        // Address fields (shared for both types)
        public string? Street { get; set; }
        public string? PostalCode { get; set; }
        public string? Locality { get; set; }
        public string? Canton { get; set; }

        // Organisation fields
        public string? CompanyName { get; set; }
        public string? LegalForm { get; set; }
        public string? Industry { get; set; }
        public string? UidNumber { get; set; }
        public DateOnly? FoundingDate { get; set; }
        public string? Homepage { get; set; }
        public string? ActivityType { get; set; }
        public string? NogaCode { get; set; }
        public decimal? Revenue { get; set; }
        public decimal? Vtbg { get; set; }
        public string? EmployeeCount { get; set; }
        public decimal? TotalSalary { get; set; }

        // Organisation contact person fields
        public string? ContactSalutation { get; set; }
        public string? ContactFirstName { get; set; }
        public string? ContactName { get; set; }
        public string? ContactPhone { get; set; }
        public string? ContactEmail { get; set; }
    }
}
