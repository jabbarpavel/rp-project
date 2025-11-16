using RP.CRM.Domain.Entities;

namespace RP.CRM.Application.Interfaces
{
    public interface IUserService
    {
        Task<User?> RegisterAsync(string email, string password, int tenantId);
        Task<string?> LoginAsync(string email, string password);
        Task<User?> GetByEmailAndTenantAsync(string email, int tenantId);
        Task<User?> GetByIdAsync(int id); // ✅ neu
        Task<User?> UpdateUserAsync(int id, string? firstName, string? name, string? phone, bool? isActive); // ✅ neu
        Task<IReadOnlyList<User>> GetAdvisorsAsync(string? q);
    }
}
