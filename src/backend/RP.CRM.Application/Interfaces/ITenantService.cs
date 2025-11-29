using RP.CRM.Domain.Entities;

namespace RP.CRM.Application.Interfaces
{
    public interface ITenantService
    {
        Task<IEnumerable<Tenant>> GetAllAsync();
        Task<Tenant?> GetByIdAsync(int id);
        Task<Tenant> CreateAsync(Tenant tenant);
        Task<Tenant> UpdateAsync(Tenant tenant);
        Task<bool> DeleteAsync(int id);
        Task<Tenant?> GetByDomainAsync(string domain); // hinzugefügt
    }
}
