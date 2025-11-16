using Microsoft.EntityFrameworkCore;
using RP.CRM.Application.Interfaces;
using RP.CRM.Domain.Entities;
using RP.CRM.Infrastructure.Data;
using RP.CRM.Infrastructure.Context;   // ⬅ neu

namespace RP.CRM.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;
        private readonly TenantContext _tenantContext;  // ⬅ neu

        public UserRepository(AppDbContext context, TenantContext tenantContext) // ⬅ neu
        {
            _context = context;
            _tenantContext = tenantContext;
        }

        // ============================================================
        // 1) GetByEmailAsync
        // ============================================================
        public async Task<User?> GetByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return null;

            var normalized = email.Trim().ToLower();

            return await _context.Users
                .Where(u => u.Email != null && u.Email.ToLower() == normalized)
                .FirstOrDefaultAsync();
        }

        // ============================================================
        // 2) GetByEmailAndTenantAsync
        // ============================================================
        public async Task<User?> GetByEmailAndTenantAsync(string email, int tenantId)
        {
            if (string.IsNullOrWhiteSpace(email))
                return null;

            var normalized = email.Trim().ToLower();

            return await _context.Users
                .Where(u =>
                    u.TenantId == tenantId &&
                    u.Email != null &&
                    u.Email.ToLower() == normalized)
                .FirstOrDefaultAsync();
        }

        // ============================================================
        // 3) GetByIdAsync
        // ============================================================
        public async Task<User?> GetByIdAsync(int id)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        // ============================================================
        // 4) CreateAsync
        // ============================================================
        public async Task<User> CreateAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        // ============================================================
        // 5) UpdateAsync
        // ============================================================
        public async Task<User> UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return user;
        }

        // ============================================================
        // 6) GetAdvisorsAsync(string? q)
        //    Nur Berater des aktuellen Tenants (TenantContext)
        // ============================================================
        public async Task<IReadOnlyList<User>> GetAdvisorsAsync(string? q)
        {
            var tenantId = _tenantContext.TenantId;

            if (tenantId <= 0)
                return Array.Empty<User>();

            var query = _context.Users
                .Where(u => u.TenantId == tenantId); // ⬅ harte Tenant-Grenze

            if (!string.IsNullOrWhiteSpace(q))
            {
                var t = q.Trim().ToLower();

                query = query.Where(u =>
                    (u.Email ?? "").ToLower().Contains(t) ||
                    (u.FirstName ?? "").ToLower().Contains(t) ||
                    (u.Name ?? "").ToLower().Contains(t)
                );
            }

            return await query
                .OrderBy(u => u.FirstName)
                .ThenBy(u => u.Name)
                .ToListAsync();
        }
    }
}
