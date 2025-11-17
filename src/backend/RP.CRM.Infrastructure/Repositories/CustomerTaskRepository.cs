using Microsoft.EntityFrameworkCore;
using RP.CRM.Application.Interfaces;
using RP.CRM.Domain.Entities;
using RP.CRM.Infrastructure.Context;
using RP.CRM.Infrastructure.Data;

namespace RP.CRM.Infrastructure.Repositories
{
    public class CustomerTaskRepository : ICustomerTaskRepository
    {
        private readonly AppDbContext _context;
        private readonly TenantContext _tenantContext;

        public CustomerTaskRepository(AppDbContext context, TenantContext tenantContext)
        {
            _context = context;
            _tenantContext = tenantContext;
        }

        public async Task<CustomerTask?> GetByIdAsync(int id)
        {
            return await _context.CustomerTasks
                .Include(t => t.Customer)
                .Include(t => t.AssignedToUser)
                .FirstOrDefaultAsync(t => t.Id == id && t.TenantId == _tenantContext.TenantId);
        }

        public async Task<IReadOnlyList<CustomerTask>> GetByCustomerIdAsync(int customerId)
        {
            return await _context.CustomerTasks
                .Include(t => t.AssignedToUser)
                .Where(t => t.CustomerId == customerId && t.TenantId == _tenantContext.TenantId)
                .OrderBy(t => t.DueDate)
                .ToListAsync();
        }

        public async Task<IReadOnlyList<CustomerTask>> GetByAssignedUserIdAsync(int userId)
        {
            return await _context.CustomerTasks
                .Include(t => t.Customer)
                .Where(t => t.AssignedToUserId == userId && t.TenantId == _tenantContext.TenantId)
                .OrderBy(t => t.DueDate)
                .ToListAsync();
        }

        public async Task<IReadOnlyList<CustomerTask>> GetOpenTasksByUserIdAsync(int userId)
        {
            return await _context.CustomerTasks
                .Include(t => t.Customer)
                .Where(t => t.AssignedToUserId == userId 
                    && t.Status == "offen" 
                    && t.TenantId == _tenantContext.TenantId)
                .OrderBy(t => t.DueDate)
                .ToListAsync();
        }

        public async Task<CustomerTask> CreateAsync(CustomerTask task)
        {
            _context.CustomerTasks.Add(task);
            await _context.SaveChangesAsync();
            return task;
        }

        public async Task<CustomerTask> UpdateAsync(CustomerTask task)
        {
            _context.CustomerTasks.Update(task);
            await _context.SaveChangesAsync();
            return task;
        }

        public async Task DeleteAsync(int id)
        {
            var task = await _context.CustomerTasks.FindAsync(id);
            if (task != null && task.TenantId == _tenantContext.TenantId)
            {
                _context.CustomerTasks.Remove(task);
                await _context.SaveChangesAsync();
            }
        }
    }
}
