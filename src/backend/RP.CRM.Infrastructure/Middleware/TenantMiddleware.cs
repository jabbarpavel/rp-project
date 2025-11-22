using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using RP.CRM.Application.Interfaces;
using RP.CRM.Infrastructure.Context;

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

            var path = (context.Request.Path.Value ?? string.Empty).ToLower();
            var host = context.Request.Host.Host.ToLower();

            int tenantId = 0;

            // =====================================================
            // 1) Login / Register / Tenant-Liste:
            //    Tenant aus voller Host-Domain ermitteln
            //    z.B. "finaro.localhost" → Domain-Spalte: "finaro.localhost"
            //    Für /register: Falls Domain nicht gefunden, versuche TenantID aus Body
            // =====================================================
            if (path.Contains("/api/user/login") ||
                path.Contains("/api/user/register") ||
                path.Contains("/api/tenant"))
            {
                var tenant = await tenantRepository.GetByDomainAsync(host);
                if (tenant != null)
                {
                    tenantId = tenant.Id;
                }
                // Fallback für /register: Wenn Domain nicht gefunden (z.B. bei IP-Zugriff via SSH),
                // versuche tenantId aus Request Body zu extrahieren
                else if (path.Contains("/api/user/register") && context.Request.Method.Equals("POST", StringComparison.OrdinalIgnoreCase))
                {
                    context.Request.EnableBuffering();
                    var body = await new StreamReader(context.Request.Body).ReadToEndAsync();
                    context.Request.Body.Position = 0;

                    try
                    {
                        using var jsonDoc = JsonDocument.Parse(body);
                        if (jsonDoc.RootElement.TryGetProperty("tenantId", out var tenantIdElement))
                        {
                            tenantId = tenantIdElement.GetInt32();
                        }
                    }
                    catch (JsonException)
                    {
                        // JSON parsing failed - invalid request body format
                        // tenantId bleibt 0, was später zur Fehlermeldung führt
                    }
                }
            }
            // =====================================================
            // 2) Alle anderen Requests:
            //    zuerst TenantID-Header, dann JWT-Claim
            // =====================================================
            else
            {
                var header = context.Request.Headers["TenantID"].FirstOrDefault();
                if (int.TryParse(header, out var parsed))
                {
                    tenantId = parsed;
                }
                else
                {
                    var claim = context.User?.Claims.FirstOrDefault(c => c.Type == "tenantId");
                    if (claim != null && int.TryParse(claim.Value, out var fromToken))
                    {
                        tenantId = fromToken;
                    }
                }
            }

            // =====================================================
            // 3) Validierung
            // =====================================================
            if (tenantId <= 0)
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                await context.Response.WriteAsync("TenantID missing or invalid.");
                return;
            }

            tenantContext.SetTenant(tenantId);
            await _next(context);
        }
    }
}
