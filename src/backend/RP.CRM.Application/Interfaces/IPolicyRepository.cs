using RP.CRM.Domain.Entities;

namespace RP.CRM.Application.Interfaces
{
    public interface IPolicyRepository
    {
        Task<Policy?> GetByIdAsync(int id);
        Task<IEnumerable<Policy>> GetByCustomerIdAsync(int customerId);
        Task<Policy> CreateAsync(Policy policy);
        Task<Policy?> UpdateAsync(Policy policy);
        Task<bool> DeleteAsync(int id);
    }
}
