using RP.CRM.Application.Interfaces;
using RP.CRM.Domain.Entities;

namespace RP.CRM.Application.Services
{
    public class TenantService : ITenantService
    {
        private readonly ITenantRepository _repository;

        public TenantService(ITenantRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Tenant>> GetAllAsync() =>
            await _repository.GetAllAsync();

        public async Task<Tenant?> GetByIdAsync(int id) =>
            await _repository.GetByIdAsync(id);

        public async Task<Tenant> CreateAsync(Tenant tenant) =>
            await _repository.CreateAsync(tenant);

        public async Task<bool> DeleteAsync(int id) =>
            await _repository.DeleteAsync(id);

        public async Task<Tenant?> GetByDomainAsync(string domain) =>
            await _repository.GetByDomainAsync(domain);
    }
}
