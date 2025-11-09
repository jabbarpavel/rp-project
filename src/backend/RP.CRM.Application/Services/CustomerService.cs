using Microsoft.Extensions.Logging;
using RP.CRM.Application.Interfaces;
using RP.CRM.Domain.Entities;

namespace RP.CRM.Application.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly ICustomerRepository _repository;
        private readonly ILogger<CustomerService> _logger;

        public CustomerService(ICustomerRepository repository, ILogger<CustomerService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<Customer>> GetAllAsync()
        {
            _logger.LogInformation("Fetching all customers");
            return await _repository.GetAllAsync();
        }

        public async Task<Customer?> GetByIdAsync(int id)
        {
            _logger.LogInformation("Fetching customer with ID {Id}", id);
            return await _repository.GetByIdAsync(id);
        }

        public async Task<Customer> CreateAsync(Customer customer)
        {
            _logger.LogInformation("Creating customer {Name}", customer.Name);
            return await _repository.CreateAsync(customer);
        }

        public async Task<Customer?> UpdateAsync(int id, Customer customer)
        {
            _logger.LogInformation("Updating customer {Id}", id);
            var updated = await _repository.UpdateAsync(id, customer);
            if (updated == null)
                _logger.LogWarning("Customer {Id} not found for update", id);
            return updated;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            _logger.LogInformation("Deleting customer {Id}", id);
            var deleted = await _repository.DeleteAsync(id);
            if (!deleted)
                _logger.LogWarning("Customer {Id} not found for deletion", id);
            return deleted;
        }
    }
}
