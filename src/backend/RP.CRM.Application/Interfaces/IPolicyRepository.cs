using RP.CRM.Domain.Entities;

namespace RP.CRM.Application.Interfaces
{
    public interface IPolicyRepository
    {
        Task<Policy?> GetByIdAsync(int id);
        Task<IReadOnlyList<Policy>> GetByCustomerIdAsync(int customerId);
        Task<Policy> CreateAsync(Policy policy);
        Task<Policy?> UpdateDocumentAsync(int id, string fileName, string filePath, string contentType, long size);
        Task<bool> SoftDeleteAsync(int id, int deleterUserId);
    }
}
