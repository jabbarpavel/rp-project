using RP.CRM.Application.DTOs;

namespace RP.CRM.Application.Interfaces
{
    public interface ICustomerRelationshipService
    {
        Task<IEnumerable<CustomerRelationshipDto>> GetByCustomerIdAsync(int customerId);
        Task<CustomerRelationshipDto?> CreateAsync(int customerId, CreateCustomerRelationshipDto dto);
        Task<bool> DeleteAsync(int id);
        Task<bool> IsPrimaryContactAsync(int customerId);
    }
}
