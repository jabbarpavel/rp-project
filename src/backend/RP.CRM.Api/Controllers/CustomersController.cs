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
    [Authorize]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _customerService;
        private readonly TenantContext _tenantContext;

        public CustomerController(ICustomerService customerService, TenantContext tenantContext)
        {
            _customerService = customerService;
            _tenantContext = tenantContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var customers = await _customerService.GetAllAsync();

            var result = customers
                .Where(c => c.TenantId == _tenantContext.TenantId)
                .Select(c => new CustomerDto
                {
                    Id = c.Id,
                    FirstName = c.FirstName,
                    Name = c.Name,
                    Email = c.Email,
                    TenantId = c.TenantId,
                    IsDeleted = c.IsDeleted,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt

                });

            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var customer = await _customerService.GetByIdAsync(id);
            if (customer is null)
                return NotFound();

            if (customer.TenantId != _tenantContext.TenantId)
                return Forbid();

            return Ok(new CustomerDto
            {
                Id = customer.Id,
                FirstName = customer.FirstName,
                Name = customer.Name,
                Email = customer.Email,
                TenantId = customer.TenantId,
                IsDeleted = customer.IsDeleted,
                CreatedAt = customer.CreatedAt,
                UpdatedAt = customer.UpdatedAt

            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCustomerDto dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var newCustomer = new Customer
            {
                FirstName = dto.FirstName.Trim(),
                Name = dto.Name.Trim(),
                Email = dto.Email.Trim(),
                TenantId = _tenantContext.TenantId
            };

            var created = await _customerService.CreateAsync(newCustomer);

            var response = new CustomerDto
            {
                Id = created.Id,
                FirstName = created.FirstName,
                Name = created.Name,
                Email = created.Email,
                TenantId = created.TenantId,
                IsDeleted = created.IsDeleted,
                CreatedAt = created.CreatedAt,
                UpdatedAt = created.UpdatedAt

            };

            return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateCustomerDto dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var existing = await _customerService.GetByIdAsync(id);
            if (existing is null)
                return NotFound();

            if (existing.TenantId != _tenantContext.TenantId)
                return Forbid();

            existing.FirstName = dto.FirstName.Trim();
            existing.Name = dto.Name.Trim();
            existing.Email = dto.Email.Trim();

            var updated = await _customerService.UpdateAsync(id, existing);
            if (updated is null)
                return NotFound();

            return Ok(new CustomerDto
            {
                Id = updated.Id,
                FirstName = updated.FirstName,
                Name = updated.Name,
                Email = updated.Email,
                TenantId = updated.TenantId,
                IsDeleted = updated.IsDeleted,
                CreatedAt = updated.CreatedAt,
                UpdatedAt = updated.UpdatedAt

            });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var customer = await _customerService.GetByIdAsync(id);
            if (customer is null)
                return NotFound();

            if (customer.TenantId != _tenantContext.TenantId)
                return Forbid();

            var deleted = await _customerService.DeleteAsync(id);
            return deleted ? NoContent() : NotFound();
        }
    }
}
