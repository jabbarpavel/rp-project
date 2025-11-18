using RP.CRM.Domain.Entities;

namespace RP.CRM.Application.Interfaces
{
    public interface ICustomerRelationshipRepository
    {
        Task<IEnumerable<CustomerRelationship>> GetByCustomerIdAsync(int customerId);
        Task<CustomerRelationship?> GetByIdAsync(int id);
        Task<CustomerRelationship> CreateAsync(CustomerRelationship relationship);
        Task<bool> DeleteAsync(int id);
        Task<bool> RelationshipExistsAsync(int customerId, int relatedCustomerId, string relationshipType);
    }
}
