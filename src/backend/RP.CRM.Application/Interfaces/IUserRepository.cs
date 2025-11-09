using RP.CRM.Domain.Entities;

namespace RP.CRM.Application.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByEmailAndTenantAsync(string email, int tenantId); // hinzugefügt
        Task<User> CreateAsync(User user);
    }
}
