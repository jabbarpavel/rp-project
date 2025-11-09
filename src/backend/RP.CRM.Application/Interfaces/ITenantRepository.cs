using RP.CRM.Domain.Entities;

namespace RP.CRM.Application.Interfaces
{
    public interface ITenantRepository
    {
        Task<IEnumerable<Tenant>> GetAllAsync();
        Task<Tenant?> GetByIdAsync(int id);
        Task<Tenant> CreateAsync(Tenant tenant);
        Task<bool> DeleteAsync(int id);
        Task<Tenant?> GetByDomainAsync(string domain); // hinzugefügt
    }
}
