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
                    Name = c.Name,
                    FirstName = c.FirstName,
                    Email = c.Email,
                    AHVNum = c.AHVNum,
                    AdvisorId = c.AdvisorId,
                    AdvisorEmail = c.Advisor != null ? c.Advisor.Email : null,
                    AdvisorFirstName = c.Advisor != null ? c.Advisor.FirstName : null,
                    AdvisorLastName = c.Advisor != null ? c.Advisor.Name : null,
                    AdvisorPhone = c.Advisor != null ? c.Advisor.Phone : null,          
                    AdvisorIsActive = c.Advisor != null ? c.Advisor.IsActive : null, 

                    CivilStatus = c.CivilStatus,
                    Religion = c.Religion,
                    Gender = c.Gender,
                    Salutation = c.Salutation,
                    BirthDate = c.BirthDate,
                    Profession = c.Profession,
                    Language = c.Language,

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
                Name = customer.Name,
                FirstName = customer.FirstName,
                Email = customer.Email,
                AHVNum = customer.AHVNum,
                AdvisorId = customer.AdvisorId,
                AdvisorEmail = customer.Advisor != null ? customer.Advisor.Email : null,
                AdvisorFirstName = customer.Advisor != null ? customer.Advisor.FirstName : null,
                AdvisorLastName = customer.Advisor != null ? customer.Advisor.Name : null,
                AdvisorPhone = customer.Advisor != null ? customer.Advisor.Phone : null,        
                AdvisorIsActive = customer.Advisor != null ? customer.Advisor.IsActive : null,  

                CivilStatus = customer.CivilStatus,
                Religion = customer.Religion,
                Gender = customer.Gender,
                Salutation = customer.Salutation,
                BirthDate = customer.BirthDate,
                Profession = customer.Profession,
                Language = customer.Language,

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
                Name = dto.Name.Trim(),
                FirstName = dto.FirstName.Trim(),
                Email = dto.Email.Trim(),
                AHVNum = dto.AHVNum.Trim(),
                TenantId = _tenantContext.TenantId,
                AdvisorId = dto.AdvisorId,

                CivilStatus = dto.CivilStatus,
                Religion = dto.Religion,
                Gender = dto.Gender,
                Salutation = dto.Salutation,
                BirthDate = dto.BirthDate,
                Profession = dto.Profession,
                Language = dto.Language

            };

            var created = await _customerService.CreateAsync(newCustomer);

            var response = new CustomerDto
            {
                Id = created.Id,
                Name = created.Name,
                FirstName = created.FirstName,
                Email = created.Email,
                AHVNum = created.AHVNum,
                AdvisorId = created.AdvisorId,
                AdvisorEmail = created.Advisor?.Email,
                AdvisorFirstName = created.Advisor?.FirstName,
                AdvisorLastName = created.Advisor?.Name,
                AdvisorPhone = created.Advisor?.Phone,                 
                AdvisorIsActive = created.Advisor?.IsActive, 

                CivilStatus = created.CivilStatus,
                Religion = created.Religion,
                Gender = created.Gender,
                Salutation = created.Salutation,
                BirthDate = created.BirthDate,
                Profession = created.Profession,
                Language = created.Language,


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

            existing.Name = dto.Name.Trim();
            existing.FirstName = dto.FirstName.Trim();
            existing.Email = dto.Email.Trim();
            existing.AHVNum = dto.AHVNum.Trim();
            existing.AdvisorId = dto.AdvisorId;

            existing.CivilStatus = dto.CivilStatus;
            existing.Religion = dto.Religion;
            existing.Gender = dto.Gender;
            existing.Salutation = dto.Salutation;
            existing.BirthDate = dto.BirthDate;
            existing.Profession = dto.Profession;
            existing.Language = dto.Language;


            var updated = await _customerService.UpdateAsync(id, existing);
            if (updated is null)
                return NotFound();

            return Ok(new CustomerDto
            {
                Id = updated.Id,
                Name = updated.Name,
                FirstName = updated.FirstName,
                Email = updated.Email,
                AHVNum = updated.AHVNum,
                AdvisorId = updated.AdvisorId,
                AdvisorEmail = updated.Advisor?.Email,
                AdvisorFirstName = updated.Advisor?.FirstName,
                AdvisorLastName = updated.Advisor?.Name,
                AdvisorPhone = updated.Advisor?.Phone,                 
                AdvisorIsActive = updated.Advisor?.IsActive, 
                
                CivilStatus = updated.CivilStatus,
                Religion = updated.Religion,
                Gender = updated.Gender,
                Salutation = updated.Salutation,
                BirthDate = updated.BirthDate,
                Profession = updated.Profession,
                Language = updated.Language,

                TenantId = updated.TenantId,
                IsDeleted = updated.IsDeleted,
                CreatedAt = updated.CreatedAt,
                UpdatedAt = updated.UpdatedAt
            });
        }

        public class ChangeAdvisorRequest { public int? AdvisorId { get; set; } }

        [HttpPut("{id:int}/advisor")]
        public async Task<IActionResult> ChangeAdvisor(int id, [FromBody] ChangeAdvisorRequest req)
        {
            var existing = await _customerService.GetByIdAsync(id);
            if (existing is null) return NotFound();
            if (existing.TenantId != _tenantContext.TenantId) return Forbid();

            var ok = await _customerService.AssignAdvisorAsync(id, req.AdvisorId);
            if (!ok) return BadRequest("Advisor ungültig oder falscher Tenant.");

            var updated = await _customerService.GetByIdAsync(id);

            return Ok(new CustomerDto
            {
                Id = updated!.Id,
                FirstName = updated.FirstName,
                Name = updated.Name,
                Email = updated.Email,
                AHVNum = updated.AHVNum,
                AdvisorId = updated.AdvisorId,
                AdvisorEmail = updated.Advisor?.Email,
                AdvisorFirstName = updated.Advisor?.FirstName,
                AdvisorLastName = updated.Advisor?.Name,
                AdvisorPhone = updated.Advisor?.Phone,                 
                AdvisorIsActive = updated.Advisor?.IsActive,

                CivilStatus = updated.CivilStatus,
                Religion = updated.Religion,
                Gender = updated.Gender,
                Salutation = updated.Salutation,
                BirthDate = updated.BirthDate,
                Profession = updated.Profession,
                Language = updated.Language,

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
