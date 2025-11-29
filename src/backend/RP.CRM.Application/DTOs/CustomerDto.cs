using System;
using System.ComponentModel.DataAnnotations;
using RP.CRM.Domain.Enums;

namespace RP.CRM.Application.DTOs
{

    public class CustomerDto
    {
        public int Id { get; set; }
        public string CustomerNumber => $"KND-{Id:D5}";
        public CustomerType CustomerType { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        public string AHVNum { get; set; } = string.Empty;

        public int? AdvisorId { get; set; }
        public string? AdvisorEmail { get; set; }
        public string? AdvisorFirstName { get; set; }
        public string? AdvisorLastName { get; set; }
        public string? AdvisorPhone { get; set; }
        public bool? AdvisorIsActive { get; set; }

        // Privatperson fields
        public string? CivilStatus { get; set; }
        public string? Religion { get; set; }
        public string? Gender { get; set; }
        public string? Salutation { get; set; }
        public DateOnly? BirthDate { get; set; }
        public string? Profession { get; set; }
        public string? Language { get; set; }

        // Address fields
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

        public bool IsPrimaryContact { get; set; }

        public int TenantId { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }


    public class CreateCustomerDto
    {
        public CustomerType CustomerType { get; set; } = CustomerType.Privatperson;

        // For Privatperson: FirstName + Name = Full name
        // For Organisation: Name = Company display name (usually same as CompanyName)
        public string FirstName { get; set; } = string.Empty;

        [Required, MinLength(2)]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [RegularExpression(@"^(756\.\d{4}\.\d{4}\.\d{2})?$",
            ErrorMessage = "AHV-Nummer ist optional, muss aber dem Format 756.xxxx.xxxx.xx entsprechen wenn angegeben.")]
        public string? AHVNum { get; set; }

        public int? AdvisorId { get; set; }

        // Privatperson fields
        public string? CivilStatus { get; set; }
        public string? Religion { get; set; }
        public string? Gender { get; set; }
        public string? Salutation { get; set; }
        public DateOnly? BirthDate { get; set; }
        public string? Profession { get; set; }
        public string? Language { get; set; }
        
        // Address fields
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
        
        public bool IsPrimaryContact { get; set; } = true; // Default true

    }
}

