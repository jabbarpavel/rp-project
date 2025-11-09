using System.ComponentModel.DataAnnotations;

namespace RP.CRM.Application.DTOs
{
    public class CustomerDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int TenantId { get; set; }   // hinzugefügt
    }

    public class CreateCustomerDto
    {
        [Required, MinLength(2)]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}
