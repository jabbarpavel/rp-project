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
        public int? AdvisorId { get; set; }          // neu
        public string? AdvisorEmail { get; set; }    // neu (vorerst nur Email vorhanden)

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
    }
}
