using RP.CRM.Application.Interfaces;
using RP.CRM.Domain.Entities;

namespace RP.CRM.Application.Services
{
    public class CustomerTaskService : ICustomerTaskService
    {
        private readonly ICustomerTaskRepository _repository;

        public CustomerTaskService(ICustomerTaskRepository repository)
        {
            _repository = repository;
        }

        public async Task<CustomerTask?> GetByIdAsync(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<IReadOnlyList<CustomerTask>> GetByCustomerIdAsync(int customerId)
        {
            return await _repository.GetByCustomerIdAsync(customerId);
        }

        public async Task<IReadOnlyList<CustomerTask>> GetByAssignedUserIdAsync(int userId)
        {
            return await _repository.GetByAssignedUserIdAsync(userId);
        }

        public async Task<IReadOnlyList<CustomerTask>> GetOpenTasksByUserIdAsync(int userId)
        {
            return await _repository.GetOpenTasksByUserIdAsync(userId);
        }

        public async Task<CustomerTask> CreateAsync(CustomerTask task)
        {
            return await _repository.CreateAsync(task);
        }

        public async Task<CustomerTask> UpdateAsync(CustomerTask task)
        {
            return await _repository.UpdateAsync(task);
        }

        public async Task DeleteAsync(int id)
        {
            await _repository.DeleteAsync(id);
        }
    }
}
