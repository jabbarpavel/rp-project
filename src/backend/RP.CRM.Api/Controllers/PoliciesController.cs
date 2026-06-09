using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RP.CRM.Application.DTOs;
using RP.CRM.Application.Interfaces;
using RP.CRM.Domain.Entities;
using RP.CRM.Domain.Enums;
using RP.CRM.Infrastructure.Authorization;
using RP.CRM.Infrastructure.Context;
using System.Security.Claims;

namespace RP.CRM.Api.Controllers
{
    [ApiController]
    [Route("api/customer/{customerId:int}/policies")]
    [Authorize]
    public class PoliciesController : ControllerBase
    {
        private readonly IPolicyService _policyService;
        private readonly ICustomerService _customerService;
        private readonly TenantContext _tenantContext;
        private readonly IWebHostEnvironment _environment;

        public PoliciesController(
            IPolicyService policyService,
            ICustomerService customerService,
            TenantContext tenantContext,
            IWebHostEnvironment environment)
        {
            _policyService = policyService;
            _customerService = customerService;
            _tenantContext = tenantContext;
            _environment = environment;
        }

        private static string? FullName(User? u) =>
            u == null ? null : $"{u.FirstName} {u.Name}".Trim();

        private static string LabelFor(PolicyStatus status) => status switch
        {
            PolicyStatus.Active => "Aktiv",
            PolicyStatus.Suspended => "Sistiert",
            PolicyStatus.Terminated => "Gekündigt",
            PolicyStatus.Expired => "Abgelaufen",
            _ => status.ToString()
        };

        private static PolicyDto MapToDto(Policy p) => new()
        {
            Id = p.Id,
            CustomerId = p.CustomerId,
            PolicyNumber = p.PolicyNumber,
            Type = p.Type,
            Company = p.Company,
            StartDate = p.StartDate,
            EndDate = p.EndDate,
            OrganizationalUnit = p.OrganizationalUnit,
            AdvisorUserId = p.AdvisorUserId,
            AdvisorName = FullName(p.Advisor),
            Status = p.Status,
            StatusLabel = LabelFor(p.Status),
            DocumentFileName = p.DocumentFileName,
            DocumentContentType = p.DocumentContentType,
            DocumentFileSize = p.DocumentFileSize,
            HasDocument = !string.IsNullOrEmpty(p.DocumentFilePath),
            CreatedByUserId = p.CreatedByUserId,
            CreatedByUserName = FullName(p.CreatedByUser),
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        };

        private int? GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(claim) || !int.TryParse(claim, out var id))
                return null;
            return id;
        }

        private async Task<Customer?> GetOwnedCustomer(int customerId)
        {
            var customer = await _customerService.GetByIdAsync(customerId);
            if (customer == null || customer.TenantId != _tenantContext.TenantId)
                return null;
            return customer;
        }

        [HttpGet]
        [RequirePermission(Permission.ViewCustomers)]
        public async Task<IActionResult> GetAll(int customerId)
        {
            var customer = await GetOwnedCustomer(customerId);
            if (customer == null) return NotFound();

            var policies = await _policyService.GetByCustomerIdAsync(customerId);
            return Ok(policies.Select(MapToDto));
        }

        [HttpPost]
        [RequirePermission(Permission.UploadDocuments)]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create(
            int customerId,
            [FromForm] string policyNumber,
            [FromForm] string type,
            [FromForm] string company,
            [FromForm] DateTime startDate,
            [FromForm] DateTime? endDate,
            [FromForm] string? organizationalUnit,
            [FromForm] int? advisorUserId,
            [FromForm] PolicyStatus status,
            [FromForm] IFormFile? file)
        {
            var customer = await GetOwnedCustomer(customerId);
            if (customer == null) return NotFound();

            if (string.IsNullOrWhiteSpace(policyNumber)) return BadRequest("Policennummer fehlt.");
            if (string.IsNullOrWhiteSpace(type)) return BadRequest("Typ fehlt.");
            if (string.IsNullOrWhiteSpace(company)) return BadRequest("Gesellschaft fehlt.");
            if (file == null || file.Length == 0) return BadRequest("Dokument fehlt.");

            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            // Persist file to disk under uploads/{tenantId}/policies/
            var uploadsPath = Path.Combine(
                _environment.ContentRootPath,
                "uploads",
                _tenantContext.TenantId.ToString(),
                "policies");
            Directory.CreateDirectory(uploadsPath);

            var extension = Path.GetExtension(file.FileName);
            var storedName = $"{Guid.NewGuid()}{extension}";
            var storedPath = Path.Combine(uploadsPath, storedName);

            await using (var stream = new FileStream(storedPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var policy = new Policy
            {
                CustomerId = customerId,
                PolicyNumber = policyNumber.Trim(),
                Type = type.Trim(),
                Company = company.Trim(),
                StartDate = DateTime.SpecifyKind(startDate, DateTimeKind.Utc),
                EndDate = endDate.HasValue ? DateTime.SpecifyKind(endDate.Value, DateTimeKind.Utc) : null,
                OrganizationalUnit = string.IsNullOrWhiteSpace(organizationalUnit) ? null : organizationalUnit.Trim(),
                AdvisorUserId = advisorUserId,
                Status = status,
                CreatedByUserId = userId.Value,
                DocumentFileName = file.FileName,
                DocumentFilePath = storedPath,
                DocumentContentType = file.ContentType,
                DocumentFileSize = file.Length
            };

            var created = await _policyService.CreateAsync(policy);
            return Ok(MapToDto(created));
        }

        [HttpGet("{policyId:int}/document")]
        [RequirePermission(Permission.ViewCustomers)]
        public async Task<IActionResult> Download(int customerId, int policyId)
        {
            var policy = await _policyService.GetByIdAsync(policyId);
            if (policy == null || policy.CustomerId != customerId) return NotFound();
            if (string.IsNullOrEmpty(policy.DocumentFilePath) || !System.IO.File.Exists(policy.DocumentFilePath))
                return NotFound("Dokument nicht gefunden.");

            var memory = new MemoryStream();
            await using (var stream = new FileStream(policy.DocumentFilePath, FileMode.Open, FileAccess.Read))
            {
                await stream.CopyToAsync(memory);
            }
            memory.Position = 0;

            return File(memory, policy.DocumentContentType ?? "application/octet-stream", policy.DocumentFileName ?? "police");
        }

        [HttpDelete("{policyId:int}")]
        [RequirePermission(Permission.DeleteCustomers)]
        public async Task<IActionResult> Delete(int customerId, int policyId)
        {
            var policy = await _policyService.GetByIdAsync(policyId);
            if (policy == null || policy.CustomerId != customerId) return NotFound();

            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var ok = await _policyService.SoftDeleteAsync(policyId, userId.Value);
            return ok ? NoContent() : NotFound();
        }
    }
}
