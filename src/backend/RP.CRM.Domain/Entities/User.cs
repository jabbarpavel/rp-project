using System.ComponentModel.DataAnnotations.Schema;
using RP.CRM.Domain.Enums;

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

        // Permission flags for role-based access control
        public int Permissions { get; set; } = (int)Permission.User;

        // 🔹 Beziehung zum Tenant (nur 1x!)
        [ForeignKey(nameof(TenantId))]
        public Tenant? Tenant { get; set; }

        // Helper method to check if user has a specific permission
        public bool HasPermission(Permission permission)
        {
            return (Permissions & (int)permission) == (int)permission;
        }
    }
}
