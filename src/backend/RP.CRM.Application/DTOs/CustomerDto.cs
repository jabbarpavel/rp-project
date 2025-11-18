using System;
using System.ComponentModel.DataAnnotations;

namespace RP.CRM.Application.DTOs
{

    public class CustomerDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        [Required]
        [RegularExpression(@"^756\.\d{4}\.\d{4}\.\d{2}$",
            ErrorMessage = "AHV-Nummer muss dem Format 756.xxxx.xxxx.xx entsprechen.")]
        public string AHVNum { get; set; } = string.Empty;

        public int? AdvisorId { get; set; }
        public string? AdvisorEmail { get; set; }
        public string? AdvisorFirstName { get; set; }
        public string? AdvisorLastName { get; set; }
        public string? AdvisorPhone { get; set; }
        public bool? AdvisorIsActive { get; set; }

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

        public bool IsPrimaryContact { get; set; }

        public int TenantId { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }


    public class CreateCustomerDto
    {
        [Required, MinLength(2)]
        public string FirstName { get; set; } = string.Empty;

        [Required, MinLength(2)]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [RegularExpression(@"^756\.\d{4}\.\d{4}\.\d{2}$",
            ErrorMessage = "AHV-Nummer muss dem Format 756.xxxx.xxxx.xx entsprechen.")]
        public string AHVNum { get; set; } = string.Empty;

        public int? AdvisorId { get; set; }

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
        
        public bool IsPrimaryContact { get; set; } = true; // Default true

    }
}
