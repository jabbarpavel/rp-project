namespace RP.CRM.Application.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public string? FirstName { get; set; }
        public string? Name { get; set; }
        public string? Phone { get; set; }

        public string Email { get; set; } = string.Empty;
        public int TenantId { get; set; }
        public bool IsActive { get; set; }
    }
}
