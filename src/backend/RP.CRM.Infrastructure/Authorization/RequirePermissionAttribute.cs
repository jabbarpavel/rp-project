using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using RP.CRM.Domain.Enums;
using RP.CRM.Infrastructure.Context;
using RP.CRM.Infrastructure.Data;
using System.Linq;
using System.Security.Claims;

namespace RP.CRM.Infrastructure.Authorization
{
    public class RequirePermissionAttribute : TypeFilterAttribute
    {
        public RequirePermissionAttribute(Permission permission) 
            : base(typeof(PermissionFilter))
        {
            Arguments = new object[] { permission };
        }
    }

    public class PermissionFilter : IAuthorizationFilter
    {
        private readonly Permission _requiredPermission;
        private readonly AppDbContext _dbContext;
        private readonly TenantContext _tenantContext;

        public PermissionFilter(Permission requiredPermission, AppDbContext dbContext, TenantContext tenantContext)
        {
            _requiredPermission = requiredPermission;
            _dbContext = dbContext;
            _tenantContext = tenantContext;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var userIdClaim = context.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var user = _dbContext.Users.FirstOrDefault(u => u.Id == userId && u.TenantId == _tenantContext.TenantId);
            
            if (user == null || !user.IsActive)
            {
                context.Result = new ForbidResult();
                return;
            }

            if (!user.HasPermission(_requiredPermission))
            {
                context.Result = new ForbidResult();
                return;
            }
        }
    }
}
