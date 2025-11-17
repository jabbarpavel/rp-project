using RP.CRM.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RP.CRM.Application.Interfaces
{
    public interface IDocumentService
    {
        Task<Document?> GetByIdAsync(int id);
        Task<IEnumerable<Document>> GetByCustomerIdAsync(int customerId);
        Task<Document> CreateAsync(Document document);
        Task<bool> DeleteAsync(int id);
    }
}
