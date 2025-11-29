using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RP.CRM.Application.DTOs;
using RP.CRM.Application.Interfaces;
using RP.CRM.Domain.Entities;
using RP.CRM.Infrastructure.Context;

namespace RP.CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TenantController : ControllerBase
    {
        private readonly ITenantService _tenantService;
        private readonly TenantContext _tenantContext;

        public TenantController(ITenantService tenantService, TenantContext tenantContext)
        {
            _tenantService = tenantService;
            _tenantContext = tenantContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tenants = await _tenantService.GetAllAsync();
            var result = tenants.Select(t => new TenantDto 
            { 
                Id = t.Id, 
                Name = t.Name, 
                Domain = t.Domain,
                LogoData = t.LogoData
            });

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var tenant = await _tenantService.GetByIdAsync(id);
            if (tenant == null)
                return NotFound();

            return Ok(new TenantDto 
            { 
                Id = tenant.Id, 
                Name = tenant.Name, 
                Domain = tenant.Domain,
                LogoData = tenant.LogoData
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTenantDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var domain = string.IsNullOrWhiteSpace(dto.Domain)
                ? dto.Name.ToLower().Trim()
                : dto.Domain.ToLower().Trim();

            var tenant = new Tenant
            {
                Name = dto.Name.Trim(),
                Domain = domain
            };

            var created = await _tenantService.CreateAsync(tenant);

            return CreatedAtAction(nameof(GetById), new { id = created.Id },
                new TenantDto 
                { 
                    Id = created.Id, 
                    Name = created.Name, 
                    Domain = created.Domain,
                    LogoData = created.LogoData
                });
        }

        [HttpPut("{id}/logo")]
        [Authorize]
        public async Task<IActionResult> UpdateLogo(int id, [FromBody] UpdateTenantLogoDto dto)
        {
            // Only allow updating logo for the current tenant
            if (id != _tenantContext.TenantId)
                return Forbid();

            var tenant = await _tenantService.GetByIdAsync(id);
            if (tenant == null)
                return NotFound();

            // Validate base64 image data
            if (string.IsNullOrWhiteSpace(dto.LogoData))
            {
                // Clear the logo
                tenant.LogoData = null;
            }
            else
            {
                // Check if it's a valid data URL (e.g., data:image/png;base64,...)
                if (!dto.LogoData.StartsWith("data:image/"))
                    return BadRequest("Invalid image format. Expected data URL with image type.");

                tenant.LogoData = dto.LogoData;
            }

            await _tenantService.UpdateAsync(tenant);

            return Ok(new TenantDto
            {
                Id = tenant.Id,
                Name = tenant.Name,
                Domain = tenant.Domain,
                LogoData = tenant.LogoData
            });
        }

        [HttpDelete("{id}/logo")]
        [Authorize]
        public async Task<IActionResult> DeleteLogo(int id)
        {
            // Only allow deleting logo for the current tenant
            if (id != _tenantContext.TenantId)
                return Forbid();

            var tenant = await _tenantService.GetByIdAsync(id);
            if (tenant == null)
                return NotFound();

            tenant.LogoData = null;
            await _tenantService.UpdateAsync(tenant);

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _tenantService.DeleteAsync(id);
            if (!deleted)
                return NotFound();

            return NoContent();
        }
    }
}
