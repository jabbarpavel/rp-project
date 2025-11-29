using Microsoft.EntityFrameworkCore;
using RP.CRM.Application.Interfaces;
using RP.CRM.Domain.Entities;
using RP.CRM.Infrastructure.Data;

namespace RP.CRM.Infrastructure.Repositories
{
    public class TenantRepository : ITenantRepository
    {
        private readonly AppDbContext _context;

        public TenantRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Tenant>> GetAllAsync()
        {
            return await _context.Tenants.ToListAsync();
        }

        public async Task<Tenant?> GetByIdAsync(int id)
        {
            return await _context.Tenants.FindAsync(id);
        }

        public async Task<Tenant?> GetByDomainAsync(string domain)
        {
            if (string.IsNullOrWhiteSpace(domain))
                return null;

            return await _context.Tenants
                .FirstOrDefaultAsync(t => t.Domain.ToLower() == domain.ToLower());
        }

        public async Task<Tenant> CreateAsync(Tenant tenant)
        {
            _context.Tenants.Add(tenant);
            await _context.SaveChangesAsync();
            return tenant;
        }

        public async Task<Tenant> UpdateAsync(Tenant tenant)
        {
            _context.Tenants.Update(tenant);
            await _context.SaveChangesAsync();
            return tenant;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var tenant = await _context.Tenants.FindAsync(id);
            if (tenant == null) return false;

            _context.Tenants.Remove(tenant);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
