using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RP.CRM.Application.DTOs;
using RP.CRM.Application.Interfaces;
using RP.CRM.Domain.Entities;
using RP.CRM.Domain.Enums;
using RP.CRM.Infrastructure.Authorization;
using RP.CRM.Infrastructure.Context;

namespace RP.CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _customerService;
        private readonly ICustomerRelationshipService _relationshipService;
        private readonly TenantContext _tenantContext;

        public CustomerController(
            ICustomerService customerService, 
            ICustomerRelationshipService relationshipService,
            TenantContext tenantContext)
        {
            _customerService = customerService;
            _relationshipService = relationshipService;
            _tenantContext = tenantContext;
        }

        private static CustomerDto MapToDto(Customer c, bool includeAllFields = false)
        {
            var dto = new CustomerDto
            {
                Id = c.Id,
                CustomerType = c.CustomerType,
                Name = c.Name,
                FirstName = c.FirstName,
                Email = c.Email,
                AHVNum = c.AHVNum,
                AdvisorId = c.AdvisorId,
                AdvisorEmail = c.Advisor?.Email,
                AdvisorFirstName = c.Advisor?.FirstName,
                AdvisorLastName = c.Advisor?.Name,
                AdvisorPhone = c.Advisor?.Phone,
                AdvisorIsActive = c.Advisor?.IsActive,
                IsPrimaryContact = c.IsPrimaryContact,
                TenantId = c.TenantId,
                IsDeleted = c.IsDeleted,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                // Always include CompanyName for customer list display
                CompanyName = c.CompanyName
            };

            if (includeAllFields)
            {
                // Privatperson fields
                dto.CivilStatus = c.CivilStatus;
                dto.Religion = c.Religion;
                dto.Gender = c.Gender;
                dto.Salutation = c.Salutation;
                dto.BirthDate = c.BirthDate;
                dto.Profession = c.Profession;
                dto.Language = c.Language;
                
                // Address fields
                dto.Street = c.Street;
                dto.PostalCode = c.PostalCode;
                dto.Locality = c.Locality;
                dto.Canton = c.Canton;

                // Organisation fields (additional)
                dto.LegalForm = c.LegalForm;
                dto.Industry = c.Industry;
                dto.UidNumber = c.UidNumber;
                dto.FoundingDate = c.FoundingDate;
                dto.Homepage = c.Homepage;
                dto.ActivityType = c.ActivityType;
                dto.NogaCode = c.NogaCode;
                dto.Revenue = c.Revenue;
                dto.Vtbg = c.Vtbg;
                dto.EmployeeCount = c.EmployeeCount;
                dto.TotalSalary = c.TotalSalary;

                // Organisation contact fields
                dto.ContactSalutation = c.ContactSalutation;
                dto.ContactFirstName = c.ContactFirstName;
                dto.ContactName = c.ContactName;
                dto.ContactPhone = c.ContactPhone;
                dto.ContactEmail = c.ContactEmail;
            }

            return dto;
        }

        private static void MapFromDto(CreateCustomerDto dto, Customer customer)
        {
            customer.CustomerType = dto.CustomerType;
            customer.Name = dto.Name.Trim();
            customer.FirstName = dto.FirstName?.Trim() ?? string.Empty;
            customer.Email = dto.Email.Trim();
            customer.AHVNum = dto.AHVNum?.Trim() ?? string.Empty;
            customer.AdvisorId = dto.AdvisorId;
            customer.IsPrimaryContact = dto.IsPrimaryContact;

            // Privatperson fields
            customer.CivilStatus = dto.CivilStatus;
            customer.Religion = dto.Religion;
            customer.Gender = dto.Gender;
            customer.Salutation = dto.Salutation;
            customer.BirthDate = dto.BirthDate;
            customer.Profession = dto.Profession;
            customer.Language = dto.Language;

            // Address fields
            customer.Street = dto.Street;
            customer.PostalCode = dto.PostalCode;
            customer.Locality = dto.Locality;
            customer.Canton = dto.Canton;

            // Organisation fields
            customer.CompanyName = dto.CompanyName;
            customer.LegalForm = dto.LegalForm;
            customer.Industry = dto.Industry;
            customer.UidNumber = dto.UidNumber;
            customer.FoundingDate = dto.FoundingDate;
            customer.Homepage = dto.Homepage;
            customer.ActivityType = dto.ActivityType;
            customer.NogaCode = dto.NogaCode;
            customer.Revenue = dto.Revenue;
            customer.Vtbg = dto.Vtbg;
            customer.EmployeeCount = dto.EmployeeCount;
            customer.TotalSalary = dto.TotalSalary;

            // Organisation contact fields
            customer.ContactSalutation = dto.ContactSalutation;
            customer.ContactFirstName = dto.ContactFirstName;
            customer.ContactName = dto.ContactName;
            customer.ContactPhone = dto.ContactPhone;
            customer.ContactEmail = dto.ContactEmail;
        }

        [HttpGet]
        [RequirePermission(Permission.ViewCustomers)]
        public async Task<IActionResult> GetAll()
        {
            var customers = await _customerService.GetAllAsync();

            var result = customers
                .Where(c => c.TenantId == _tenantContext.TenantId)
                .Select(c => MapToDto(c, false));

            return Ok(result);
        }

        [HttpGet("{id:int}")]
        [RequirePermission(Permission.ViewCustomers)]
        public async Task<IActionResult> GetById(int id)
        {
            var customer = await _customerService.GetByIdAsync(id);
            if (customer is null)
                return NotFound();

            if (customer.TenantId != _tenantContext.TenantId)
                return Forbid();

            return Ok(MapToDto(customer, true));
        }

        [HttpPost]
        [RequirePermission(Permission.CreateCustomers)]
        public async Task<IActionResult> Create([FromBody] CreateCustomerDto dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var newCustomer = new Customer
            {
                TenantId = _tenantContext.TenantId
            };
            MapFromDto(dto, newCustomer);

            var created = await _customerService.CreateAsync(newCustomer);

            return CreatedAtAction(nameof(GetById), new { id = created.Id }, MapToDto(created, true));
        }

        [HttpPut("{id:int}")]
        [RequirePermission(Permission.EditCustomers)]
        public async Task<IActionResult> Update(int id, [FromBody] CreateCustomerDto dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var existing = await _customerService.GetByIdAsync(id);
            if (existing is null)
                return NotFound();

            if (existing.TenantId != _tenantContext.TenantId)
                return Forbid();

            MapFromDto(dto, existing);

            var updated = await _customerService.UpdateAsync(id, existing);
            if (updated is null)
                return NotFound();

            return Ok(MapToDto(updated, true));
        }

        public class ChangeAdvisorRequest { public int? AdvisorId { get; set; } }

        [HttpPut("{id:int}/advisor")]
        [RequirePermission(Permission.EditCustomers)]
        public async Task<IActionResult> ChangeAdvisor(int id, [FromBody] ChangeAdvisorRequest req)
        {
            var existing = await _customerService.GetByIdAsync(id);
            if (existing is null) return NotFound();
            if (existing.TenantId != _tenantContext.TenantId) return Forbid();

            var ok = await _customerService.AssignAdvisorAsync(id, req.AdvisorId);
            if (!ok) return BadRequest("Advisor ungültig oder falscher Tenant.");

            var updated = await _customerService.GetByIdAsync(id);

            return Ok(MapToDto(updated!, true));
        }

        [HttpDelete("{id:int}")]
        [RequirePermission(Permission.DeleteCustomers)]
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

        // ====== Relationship Endpoints ======

        [HttpGet("{id:int}/relationships")]
        [RequirePermission(Permission.ViewCustomers)]
        public async Task<IActionResult> GetRelationships(int id)
        {
            var customer = await _customerService.GetByIdAsync(id);
            if (customer == null)
                return NotFound();

            if (customer.TenantId != _tenantContext.TenantId)
                return Forbid();

            var relationships = await _relationshipService.GetByCustomerIdAsync(id);
            return Ok(relationships);
        }

        [HttpPost("{id:int}/relationships")]
        [RequirePermission(Permission.EditCustomers)]
        public async Task<IActionResult> CreateRelationship(int id, [FromBody] CreateCustomerRelationshipDto dto)
        {
            var customer = await _customerService.GetByIdAsync(id);
            if (customer == null)
                return NotFound();

            if (customer.TenantId != _tenantContext.TenantId)
                return Forbid();

            var relatedCustomer = await _customerService.GetByIdAsync(dto.RelatedCustomerId);
            if (relatedCustomer == null)
                return BadRequest("Related customer not found");

            if (relatedCustomer.TenantId != _tenantContext.TenantId)
                return BadRequest("Related customer must be in the same tenant");

            var created = await _relationshipService.CreateAsync(id, dto);
            if (created == null)
                return BadRequest("Relationship already exists or could not be created");

            return CreatedAtAction(nameof(GetRelationships), new { id }, created);
        }

        [HttpDelete("relationships/{relationshipId:int}")]
        [RequirePermission(Permission.EditCustomers)]
        public async Task<IActionResult> DeleteRelationship(int relationshipId)
        {
            var deleted = await _relationshipService.DeleteAsync(relationshipId);
            return deleted ? NoContent() : NotFound();
        }

        [HttpPut("{id:int}/primary-contact")]
        [RequirePermission(Permission.EditCustomers)]
        public async Task<IActionResult> UpdatePrimaryContact(int id, [FromBody] bool isPrimaryContact)
        {
            var customer = await _customerService.GetByIdAsync(id);
            if (customer == null)
                return NotFound();

            if (customer.TenantId != _tenantContext.TenantId)
                return Forbid();

            customer.IsPrimaryContact = isPrimaryContact;
            var updated = await _customerService.UpdateAsync(id, customer);
            
            if (updated == null)
                return NotFound();

            return Ok(new { isPrimaryContact = updated.IsPrimaryContact });
        }

        [HttpGet("{id:int}/is-primary-contact")]
        [RequirePermission(Permission.ViewCustomers)]
        public async Task<IActionResult> IsPrimaryContact(int id)
        {
            var customer = await _customerService.GetByIdAsync(id);
            if (customer == null)
                return NotFound();

            if (customer.TenantId != _tenantContext.TenantId)
                return Forbid();

            var isPrimary = await _relationshipService.IsPrimaryContactAsync(id);
            return Ok(new { isPrimaryContact = isPrimary });
        }
    }
}
