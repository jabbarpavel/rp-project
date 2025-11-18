using Microsoft.EntityFrameworkCore;
using RP.CRM.Application.Interfaces;
using RP.CRM.Domain.Entities;
using RP.CRM.Infrastructure.Data;

namespace RP.CRM.Infrastructure.Repositories
{
    public class CustomerRelationshipRepository : ICustomerRelationshipRepository
    {
        private readonly AppDbContext _context;

        public CustomerRelationshipRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CustomerRelationship>> GetByCustomerIdAsync(int customerId)
        {
            return await _context.CustomerRelationships
                .Include(r => r.Customer)
                .Include(r => r.RelatedCustomer)
                .Where(r => r.CustomerId == customerId)
                .OrderBy(r => r.RelationshipType)
                .ThenBy(r => r.RelatedCustomer!.FirstName)
                .ToListAsync();
        }

        public async Task<CustomerRelationship?> GetByIdAsync(int id)
        {
            return await _context.CustomerRelationships
                .Include(r => r.Customer)
                .Include(r => r.RelatedCustomer)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<CustomerRelationship> CreateAsync(CustomerRelationship relationship)
        {
            _context.CustomerRelationships.Add(relationship);
            await _context.SaveChangesAsync();
            return relationship;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var relationship = await _context.CustomerRelationships.FindAsync(id);
            if (relationship == null)
                return false;

            _context.CustomerRelationships.Remove(relationship);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RelationshipExistsAsync(int customerId, int relatedCustomerId, string relationshipType)
        {
            return await _context.CustomerRelationships
                .AnyAsync(r => r.CustomerId == customerId 
                    && r.RelatedCustomerId == relatedCustomerId 
                    && r.RelationshipType == relationshipType);
        }
    }
}
