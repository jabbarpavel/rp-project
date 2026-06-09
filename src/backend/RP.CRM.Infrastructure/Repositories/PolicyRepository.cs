using Microsoft.EntityFrameworkCore;
using RP.CRM.Application.Interfaces;
using RP.CRM.Domain.Entities;
using RP.CRM.Infrastructure.Context;
using RP.CRM.Infrastructure.Data;

namespace RP.CRM.Infrastructure.Repositories
{
    public class PolicyRepository : IPolicyRepository
    {
        private readonly AppDbContext _context;
        private readonly TenantContext _tenantContext;

        public PolicyRepository(AppDbContext context, TenantContext tenantContext)
        {
            _context = context;
            _tenantContext = tenantContext;
        }

        public async Task<Policy?> GetByIdAsync(int id)
        {
            return await _context.Policies
                .Include(p => p.Advisor)
                .Include(p => p.CreatedByUser)
                .FirstOrDefaultAsync(p =>
                    p.Id == id &&
                    p.TenantId == _tenantContext.TenantId &&
                    !p.IsDeleted);
        }

        public async Task<IReadOnlyList<Policy>> GetByCustomerIdAsync(int customerId)
        {
            return await _context.Policies
                .Include(p => p.Advisor)
                .Include(p => p.CreatedByUser)
                .Where(p =>
                    p.CustomerId == customerId &&
                    p.TenantId == _tenantContext.TenantId &&
                    !p.IsDeleted)
                .OrderByDescending(p => p.StartDate)
                .ThenByDescending(p => p.Id)
                .ToListAsync();
        }

        public async Task<Policy> CreateAsync(Policy policy)
        {
            _context.Policies.Add(policy);
            await _context.SaveChangesAsync();

            await _context.Entry(policy).Reference(p => p.Advisor).LoadAsync();
            await _context.Entry(policy).Reference(p => p.CreatedByUser).LoadAsync();
            return policy;
        }

        public async Task<Policy?> UpdateDocumentAsync(int id, string fileName, string filePath, string contentType, long size)
        {
            var policy = await _context.Policies
                .FirstOrDefaultAsync(p =>
                    p.Id == id &&
                    p.TenantId == _tenantContext.TenantId &&
                    !p.IsDeleted);
            if (policy == null)
                return null;

            policy.DocumentFileName = fileName;
            policy.DocumentFilePath = filePath;
            policy.DocumentContentType = contentType;
            policy.DocumentFileSize = size;

            await _context.SaveChangesAsync();
            await _context.Entry(policy).Reference(p => p.Advisor).LoadAsync();
            await _context.Entry(policy).Reference(p => p.CreatedByUser).LoadAsync();
            return policy;
        }

        public async Task<bool> SoftDeleteAsync(int id, int deleterUserId)
        {
            var policy = await _context.Policies
                .FirstOrDefaultAsync(p =>
                    p.Id == id &&
                    p.TenantId == _tenantContext.TenantId &&
                    !p.IsDeleted);
            if (policy == null)
                return false;

            policy.IsDeleted = true;
            policy.DeletedAt = DateTime.UtcNow;
            policy.DeletedByUserId = deleterUserId;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
