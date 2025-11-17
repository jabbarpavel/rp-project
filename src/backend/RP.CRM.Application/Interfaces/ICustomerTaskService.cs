using RP.CRM.Domain.Entities;

namespace RP.CRM.Application.Interfaces
{
    public interface ICustomerTaskService
    {
        Task<CustomerTask?> GetByIdAsync(int id);
        Task<IReadOnlyList<CustomerTask>> GetByCustomerIdAsync(int customerId);
        Task<IReadOnlyList<CustomerTask>> GetByAssignedUserIdAsync(int userId);
        Task<IReadOnlyList<CustomerTask>> GetOpenTasksByUserIdAsync(int userId);
        Task<CustomerTask> CreateAsync(CustomerTask task);
        Task<CustomerTask> UpdateAsync(CustomerTask task);
        Task DeleteAsync(int id);
    }
}
