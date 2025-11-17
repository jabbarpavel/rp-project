using RP.CRM.Application.Interfaces;
using RP.CRM.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RP.CRM.Application.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly IDocumentRepository _documentRepository;

        public DocumentService(IDocumentRepository documentRepository)
        {
            _documentRepository = documentRepository;
        }

        public async Task<Document?> GetByIdAsync(int id)
        {
            return await _documentRepository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Document>> GetByCustomerIdAsync(int customerId)
        {
            return await _documentRepository.GetByCustomerIdAsync(customerId);
        }

        public async Task<Document> CreateAsync(Document document)
        {
            return await _documentRepository.CreateAsync(document);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _documentRepository.DeleteAsync(id);
        }
    }
}
