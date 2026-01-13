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
    public class PoliciesController : ControllerBase
    {
        private readonly IPolicyService _policyService;
        private readonly ICustomerService _customerService;
        private readonly TenantContext _tenantContext;

        public PoliciesController(
            IPolicyService policyService,
            ICustomerService customerService,
            TenantContext tenantContext)
        {
            _policyService = policyService;
            _customerService = customerService;
            _tenantContext = tenantContext;
        }

        [HttpGet("{id:int}")]
        [RequirePermission(Permission.ViewCustomers)]
        public async Task<IActionResult> GetById(int id)
        {
            var policy = await _policyService.GetByIdAsync(id);
            if (policy == null || policy.TenantId != _tenantContext.TenantId)
                return NotFound();

            var dto = MapToDto(policy);
            return Ok(dto);
        }

        [HttpGet("customer/{customerId:int}")]
        [RequirePermission(Permission.ViewCustomers)]
        public async Task<IActionResult> GetByCustomerId(int customerId)
        {
            var customer = await _customerService.GetByIdAsync(customerId);
            if (customer == null || customer.TenantId != _tenantContext.TenantId)
                return NotFound();

            var policies = await _policyService.GetByCustomerIdAsync(customerId);
            var dtos = policies.Select(MapToDto);

            return Ok(dtos);
        }

        [HttpPost]
        [RequirePermission(Permission.EditCustomers)]
        public async Task<IActionResult> Create([FromBody] CreatePolicyDto dto)
        {
            var customer = await _customerService.GetByIdAsync(dto.CustomerId);
            if (customer == null || customer.TenantId != _tenantContext.TenantId)
                return NotFound("Customer not found");

            var policy = new Policy
            {
                PolicyNumber = dto.PolicyNumber,
                Type = dto.Type,
                Company = dto.Company,
                OrganizationalUnit = dto.OrganizationalUnit,
                ProductName = dto.ProductName,
                MutationReason = dto.MutationReason,
                CustomerNumber = dto.CustomerNumber,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                PaymentFrequency = dto.PaymentFrequency,
                AnnualPremium = dto.AnnualPremium,
                Advisor = dto.Advisor,
                Status = dto.Status,
                DocumentId = dto.DocumentId,
                CustomerId = dto.CustomerId,
                TenantId = _tenantContext.TenantId
            };

            var created = await _policyService.CreateAsync(policy);
            var resultDto = MapToDto(created);

            return CreatedAtAction(nameof(GetById), new { id = created.Id }, resultDto);
        }

        [HttpPut("{id:int}")]
        [RequirePermission(Permission.EditCustomers)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdatePolicyDto dto)
        {
            var existing = await _policyService.GetByIdAsync(id);
            if (existing == null || existing.TenantId != _tenantContext.TenantId)
                return NotFound();

            var policy = new Policy
            {
                PolicyNumber = dto.PolicyNumber,
                Type = dto.Type,
                Company = dto.Company,
                OrganizationalUnit = dto.OrganizationalUnit,
                ProductName = dto.ProductName,
                MutationReason = dto.MutationReason,
                CustomerNumber = dto.CustomerNumber,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                PaymentFrequency = dto.PaymentFrequency,
                AnnualPremium = dto.AnnualPremium,
                Advisor = dto.Advisor,
                Status = dto.Status,
                DocumentId = dto.DocumentId
            };

            var updated = await _policyService.UpdateAsync(id, policy);
            if (updated == null)
                return NotFound();

            var resultDto = MapToDto(updated);
            return Ok(resultDto);
        }

        [HttpDelete("{id:int}")]
        [RequirePermission(Permission.DeleteCustomers)]
        public async Task<IActionResult> Delete(int id)
        {
            var policy = await _policyService.GetByIdAsync(id);
            if (policy == null || policy.TenantId != _tenantContext.TenantId)
                return NotFound();

            var deleted = await _policyService.DeleteAsync(id);
            return deleted ? NoContent() : NotFound();
        }

        private PolicyDto MapToDto(Policy policy)
        {
            return new PolicyDto
            {
                Id = policy.Id,
                PolicyNumber = policy.PolicyNumber,
                Type = policy.Type,
                TypeDisplay = GetPolicyTypeDisplay(policy.Type),
                Company = policy.Company,
                OrganizationalUnit = policy.OrganizationalUnit,
                ProductName = policy.ProductName,
                MutationReason = policy.MutationReason,
                MutationReasonDisplay = policy.MutationReason.HasValue ? GetMutationReasonDisplay(policy.MutationReason.Value) : null,
                CustomerNumber = policy.CustomerNumber,
                StartDate = policy.StartDate,
                EndDate = policy.EndDate,
                PaymentFrequency = policy.PaymentFrequency,
                PaymentFrequencyDisplay = policy.PaymentFrequency.HasValue ? GetPaymentFrequencyDisplay(policy.PaymentFrequency.Value) : null,
                AnnualPremium = policy.AnnualPremium,
                Advisor = policy.Advisor,
                Status = policy.Status,
                DocumentId = policy.DocumentId,
                DocumentFileName = policy.Document?.FileName,
                CustomerId = policy.CustomerId,
                CreatedAt = policy.CreatedAt,
                UpdatedAt = policy.UpdatedAt
            };
        }

        private string GetPolicyTypeDisplay(PolicyType type)
        {
            return type switch
            {
                PolicyType.Haushalt => "Haushalt",
                PolicyType.Krankenkasse => "Krankenkasse",
                PolicyType.Motorfahrzeugversicherung => "Motorfahrzeugversicherung",
                PolicyType.Rechtsschutz => "Rechtsschutz",
                _ => type.ToString()
            };
        }

        private string GetMutationReasonDisplay(MutationReason reason)
        {
            return reason switch
            {
                MutationReason.Unbekannt => "Unbekannt",
                MutationReason.Neugeschaft => "Neugeschäft",
                MutationReason.Mutation => "Mutation",
                MutationReason.Bestandsubernahme => "Bestandsübernahme",
                MutationReason.Ersatz => "Ersatz",
                _ => reason.ToString()
            };
        }

        private string GetPaymentFrequencyDisplay(Domain.Enums.PaymentFrequency frequency)
        {
            return frequency switch
            {
                Domain.Enums.PaymentFrequency.None => "-",
                Domain.Enums.PaymentFrequency.Monatlich => "monatlich",
                Domain.Enums.PaymentFrequency.ZweiMonatlich => "2-monatlich",
                Domain.Enums.PaymentFrequency.Vierteljahrlich => "vierteljährlich",
                Domain.Enums.PaymentFrequency.Halbjahrlich => "halbjährlich",
                Domain.Enums.PaymentFrequency.Jahrlich => "jährlich",
                Domain.Enums.PaymentFrequency.Einmaleinlage => "Einmaleinlage",
                _ => frequency.ToString()
            };
        }
    }
}
