using System.ComponentModel.DataAnnotations.Schema;

namespace RP.CRM.Domain.Entities
{
    public class User : BaseEntity
    {
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string? Role { get; set; }
        public int TenantId { get; set; }

        // Zusatzfelder
        public string? FirstName { get; set; }
        public string? Name { get; set; }
        public string? Phone { get; set; }
        public bool IsActive { get; set; } = true;

        // 🔹 Beziehung zum Tenant (nur 1x!)
        [ForeignKey(nameof(TenantId))]
        public Tenant? Tenant { get; set; }
    }
}
