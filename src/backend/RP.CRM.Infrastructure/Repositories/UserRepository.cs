using Microsoft.EntityFrameworkCore;
using RP.CRM.Application.Interfaces;
using RP.CRM.Domain.Entities;
using RP.CRM.Infrastructure.Data;
using RP.CRM.Infrastructure.Context;

namespace RP.CRM.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;
        private readonly TenantContext _tenantContext;

        public UserRepository(AppDbContext context, TenantContext tenantContext)
        {
            _context = context;
            _tenantContext = tenantContext;
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            var query = _context.Users.AsQueryable();

            if (_tenantContext.TenantId != 0)
                query = query.Where(u => u.TenantId == _tenantContext.TenantId);

            return await query.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetByEmailAndTenantAsync(string email, int tenantId)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Email.ToLower() == email.ToLower() &&
                    u.TenantId == tenantId);
        }

        public async Task<User> CreateAsync(User user)
        {
            if (user.TenantId == 0 && _tenantContext.TenantId != 0)
                user.TenantId = _tenantContext.TenantId;

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }
    }
}
