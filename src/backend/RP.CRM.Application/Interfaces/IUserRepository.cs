using RP.CRM.Domain.Entities;

namespace RP.CRM.Application.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByEmailAndTenantAsync(string email, int tenantId);
        Task<User?> GetByIdAsync(int id); // ✅ neu
        Task<User> CreateAsync(User user);
        Task<User> UpdateAsync(User user); // ✅ neu
        Task<IReadOnlyList<User>> GetAdvisorsAsync(string? q);
    }
}
