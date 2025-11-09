using Microsoft.AspNetCore.Identity;

namespace RP.CRM.Infrastructure.Entities
{
    public class ApplicationUser : IdentityUser<int>
    {
        public int TenantId { get; set; }
    }
}
