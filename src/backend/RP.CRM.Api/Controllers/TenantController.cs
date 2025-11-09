using Microsoft.AspNetCore.Mvc;
using RP.CRM.Application.DTOs;
using RP.CRM.Application.Interfaces;
using RP.CRM.Domain.Entities;

namespace RP.CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TenantController : ControllerBase
    {
        private readonly ITenantService _tenantService;

        public TenantController(ITenantService tenantService)
        {
            _tenantService = tenantService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tenants = await _tenantService.GetAllAsync();
            var result = tenants.Select(t => new TenantDto 
            { 
                Id = t.Id, 
                Name = t.Name, 
                Domain = t.Domain 
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
                Domain = tenant.Domain 
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
                    Domain = created.Domain 
                });
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
