using RP.CRM.Domain.Entities;

namespace RP.CRM.Application.Interfaces
{
    public interface IPolicyService
    {
        Task<Policy?> GetByIdAsync(int id);
        Task<IEnumerable<Policy>> GetByCustomerIdAsync(int customerId);
        Task<Policy> CreateAsync(Policy policy);
        Task<Policy?> UpdateAsync(int id, Policy policy);
        Task<bool> DeleteAsync(int id);
    }
}
