using RP.CRM.Application.Interfaces;
using RP.CRM.Domain.Entities;

namespace RP.CRM.Application.Services
{
    public class PolicyService : IPolicyService
    {
        private readonly IPolicyRepository _policyRepository;

        public PolicyService(IPolicyRepository policyRepository)
        {
            _policyRepository = policyRepository;
        }

        public async Task<Policy?> GetByIdAsync(int id)
        {
            return await _policyRepository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Policy>> GetByCustomerIdAsync(int customerId)
        {
            return await _policyRepository.GetByCustomerIdAsync(customerId);
        }

        public async Task<Policy> CreateAsync(Policy policy)
        {
            return await _policyRepository.CreateAsync(policy);
        }

        public async Task<Policy?> UpdateAsync(int id, Policy policy)
        {
            var existing = await _policyRepository.GetByIdAsync(id);
            if (existing == null)
                return null;

            existing.PolicyNumber = policy.PolicyNumber;
            existing.Type = policy.Type;
            existing.Company = policy.Company;
            existing.OrganizationalUnit = policy.OrganizationalUnit;
            existing.ProductName = policy.ProductName;
            existing.MutationReason = policy.MutationReason;
            existing.CustomerNumber = policy.CustomerNumber;
            existing.StartDate = policy.StartDate;
            existing.EndDate = policy.EndDate;
            existing.PaymentFrequency = policy.PaymentFrequency;
            existing.AnnualPremium = policy.AnnualPremium;
            existing.Advisor = policy.Advisor;
            existing.Status = policy.Status;
            existing.DocumentId = policy.DocumentId;

            return await _policyRepository.UpdateAsync(existing);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _policyRepository.DeleteAsync(id);
        }
    }
}
