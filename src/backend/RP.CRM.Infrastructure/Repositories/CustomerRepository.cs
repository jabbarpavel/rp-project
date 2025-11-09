using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using RP.CRM.Application.Interfaces;
using RP.CRM.Domain.Entities;
using RP.CRM.Infrastructure.Data;
using RP.CRM.Infrastructure.Context;

namespace RP.CRM.Infrastructure.Repositories
{
    public class CustomerRepository : ICustomerRepository
    {
        private readonly AppDbContext _context;
        private readonly TenantContext _tenantContext;
        private readonly ILogger<CustomerRepository> _logger;

        public CustomerRepository(AppDbContext context, TenantContext tenantContext, ILogger<CustomerRepository> logger)
        {
            _context = context;
            _tenantContext = tenantContext;
            _logger = logger;
        }

        public async Task<IEnumerable<Customer>> GetAllAsync()
        {
            _logger.LogInformation("Tenant {TenantId}: fetching all customers", _tenantContext.TenantId);

            var query = _context.Customers
                .Include(c => c.Tenant)
                .AsQueryable();

            if (_tenantContext.TenantId != 0)
                query = query.Where(c => c.TenantId == _tenantContext.TenantId);

            var customers = await query.ToListAsync();

            _logger.LogInformation("Tenant {TenantId}: retrieved {Count} customers", 
                _tenantContext.TenantId, customers.Count);

            return customers;
        }

        public async Task<Customer?> GetByIdAsync(int id)
        {
            _logger.LogInformation("Tenant {TenantId}: fetching customer ID {Id}", _tenantContext.TenantId, id);

            var query = _context.Customers
                .Include(c => c.Tenant)
                .AsQueryable();

            if (_tenantContext.TenantId != 0)
                query = query.Where(c => c.TenantId == _tenantContext.TenantId);

            var result = await query.FirstOrDefaultAsync(c => c.Id == id);

            if (result == null)
                _logger.LogWarning("Tenant {TenantId}: customer ID {Id} not found", _tenantContext.TenantId, id);

            return result;
        }

        public async Task<Customer> CreateAsync(Customer customer)
        {
            customer.TenantId = _tenantContext.TenantId;

            _logger.LogInformation("Tenant {TenantId}: creating customer {Name}", 
                _tenantContext.TenantId, customer.Name);

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Tenant {TenantId}: created customer {Id}", 
                _tenantContext.TenantId, customer.Id);

            return customer;
        }

        public async Task<Customer?> UpdateAsync(int id, Customer customer)
        {
            _logger.LogInformation("Tenant {TenantId}: updating customer {Id}", _tenantContext.TenantId, id);

            var existing = await _context.Customers
                .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == _tenantContext.TenantId);

            if (existing == null)
            {
                _logger.LogWarning("Tenant {TenantId}: customer {Id} not found for update", 
                    _tenantContext.TenantId, id);
                return null;
            }

            existing.Name = customer.Name;
            existing.Email = customer.Email;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Tenant {TenantId}: successfully updated customer {Id}", 
                _tenantContext.TenantId, id);

            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            _logger.LogInformation("Tenant {TenantId}: deleting customer {Id}", _tenantContext.TenantId, id);

            var existing = await _context.Customers
                .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == _tenantContext.TenantId);

            if (existing == null)
            {
                _logger.LogWarning("Tenant {TenantId}: customer {Id} not found for deletion", 
                    _tenantContext.TenantId, id);
                return false;
            }

            _context.Customers.Remove(existing);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Tenant {TenantId}: deleted customer {Id}", _tenantContext.TenantId, id);

            return true;
        }
    }
}
