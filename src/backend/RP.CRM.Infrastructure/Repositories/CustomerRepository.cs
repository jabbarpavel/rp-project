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
        private readonly IAuditLogService _audit;

        public CustomerRepository(AppDbContext context, TenantContext tenantContext, ILogger<CustomerRepository> logger, IAuditLogService audit)
        {
            _context = context;
            _tenantContext = tenantContext;
            _logger = logger;
            _audit = audit;
        }

        public async Task<IEnumerable<Customer>> GetAllAsync()
        {
            var query = _context.Customers
                .Include(c => c.Tenant)
                .Where(c => !c.IsDeleted);

            if (_tenantContext.TenantId != 0)
                query = query.Where(c => c.TenantId == _tenantContext.TenantId);

            return await query.ToListAsync();
        }

        public async Task<Customer?> GetByIdAsync(int id)
        {
            var query = _context.Customers.Include(c => c.Tenant).AsQueryable();

            if (_tenantContext.TenantId != 0)
                query = query.Where(c => c.TenantId == _tenantContext.TenantId);

            return await query.FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Customer> CreateAsync(Customer customer)
        {
            customer.TenantId = _tenantContext.TenantId;
            _logger.LogInformation("Tenant {TenantId}: creating customer {Name}", _tenantContext.TenantId, customer.Name);

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            await _audit.LogAsync(new ChangeLog
            {
                EntityName = "Customer",
                EntityId = customer.Id,
                Action = "Created",
                ChangedBy = "system",
                NewValues = System.Text.Json.JsonSerializer.Serialize(customer)
            });

            _logger.LogInformation("Tenant {TenantId}: created customer {Id}", _tenantContext.TenantId, customer.Id);
            return customer;
        }

        public async Task<Customer?> UpdateAsync(int id, Customer customer)
        {
            var existing = await _context.Customers
                .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == _tenantContext.TenantId);

            if (existing == null)
            {
                _logger.LogWarning("Tenant {TenantId}: customer {Id} not found for update", _tenantContext.TenantId, id);
                return null;
            }

            existing.FirstName = customer.FirstName;
            existing.Name = customer.Name;
            existing.Email = customer.Email;
            existing.AHVNum = customer.AHVNum;

            await _audit.CaptureEntityChangesAsync(_context, "system");
            await _context.SaveChangesAsync();

            _logger.LogInformation("Tenant {TenantId}: updated customer {Id}", _tenantContext.TenantId, id);
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _context.Customers
                .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == _tenantContext.TenantId);

            if (existing == null)
            {
                _logger.LogWarning("Tenant {TenantId}: customer {Id} not found for deletion", _tenantContext.TenantId, id);
                return false;
            }

            existing.IsDeleted = true;

            await _audit.CaptureEntityChangesAsync(_context, "system");
            await _context.SaveChangesAsync();

            _logger.LogInformation("Tenant {TenantId}: soft deleted customer {Id}", _tenantContext.TenantId, id);
            return true;
        }
    }
}
