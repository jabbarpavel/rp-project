namespace RP.CRM.Domain.Entities
{
    public class User : BaseEntity
    {
        public int Id { get; set; }

        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "User";

        public int TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;
    }
}
