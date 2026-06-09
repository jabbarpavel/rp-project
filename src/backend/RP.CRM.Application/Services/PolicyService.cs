using RP.CRM.Application.Interfaces;
using RP.CRM.Domain.Entities;

namespace RP.CRM.Application.Services
{
    public class PolicyService : IPolicyService
    {
        private readonly IPolicyRepository _repository;

        public PolicyService(IPolicyRepository repository)
        {
            _repository = repository;
        }

        public Task<Policy?> GetByIdAsync(int id) => _repository.GetByIdAsync(id);

        public Task<IReadOnlyList<Policy>> GetByCustomerIdAsync(int customerId) =>
            _repository.GetByCustomerIdAsync(customerId);

        public Task<Policy> CreateAsync(Policy policy) => _repository.CreateAsync(policy);

        public Task<Policy?> UpdateDocumentAsync(int id, string fileName, string filePath, string contentType, long size) =>
            _repository.UpdateDocumentAsync(id, fileName, filePath, contentType, size);

        public Task<bool> SoftDeleteAsync(int id, int deleterUserId) =>
            _repository.SoftDeleteAsync(id, deleterUserId);
    }
}
