using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using RP.CRM.Infrastructure.Context;
using RP.CRM.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;


namespace RP.CRM.Infrastructure.Middleware
{
    public class TenantMiddleware
    {
        private readonly RequestDelegate _next;

        public TenantMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, TenantContext tenantContext)
        {
            var tenantRepository = context.RequestServices.GetRequiredService<ITenantRepository>();
            var path = context.Request.Path.Value?.ToLower() ?? string.Empty;
            int tenantId = 0;

            // Login / Register → Tenant aus Subdomain ermitteln
            if (path.Contains("/api/user/login") ||
                path.Contains("/api/user/register") ||
                path.Contains("/api/tenant"))
            {
                var host = context.Request.Host.Host.ToLower();
                var subdomain = host.Contains('.') ? host.Split('.')[0] : host;

                var tenant = await tenantRepository.GetByDomainAsync(subdomain);
                if (tenant != null)
                    tenantId = tenant.Id;
            }
            else
            {
                // Header prüfen
                var header = context.Request.Headers["TenantID"].FirstOrDefault();
                if (int.TryParse(header, out var parsed))
                    tenantId = parsed;

                // JWT prüfen
                else
                {
                    var claim = context.User?.Claims.FirstOrDefault(c => c.Type == "tenantId");
                    if (claim != null && int.TryParse(claim.Value, out var fromToken))
                        tenantId = fromToken;
                }
            }

            if (tenantId > 0)
                tenantContext.SetTenant(tenantId);
            else
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                await context.Response.WriteAsync("TenantID missing or invalid.");
                return;
            }

            await _next(context);
        }
    }
}
