using RP.CRM.Application.DTOs;
using RP.CRM.Application.Interfaces;
using RP.CRM.Domain.Entities;
using RP.CRM.Domain.Enums;

namespace RP.CRM.Application.Services
{
    public class CustomerRelationshipService : ICustomerRelationshipService
    {
        private readonly ICustomerRelationshipRepository _repository;
        private readonly ICustomerRepository _customerRepository;

        public CustomerRelationshipService(
            ICustomerRelationshipRepository repository,
            ICustomerRepository customerRepository)
        {
            _repository = repository;
            _customerRepository = customerRepository;
        }

        public async Task<IEnumerable<CustomerRelationshipDto>> GetByCustomerIdAsync(int customerId)
        {
            var relationships = await _repository.GetByCustomerIdAsync(customerId);
            
            return relationships.Select(r => new CustomerRelationshipDto
            {
                Id = r.Id,
                CustomerId = r.CustomerId,
                CustomerFirstName = r.Customer?.FirstName,
                CustomerLastName = r.Customer?.Name,
                RelatedCustomerId = r.RelatedCustomerId,
                RelatedCustomerFirstName = r.RelatedCustomer?.FirstName,
                RelatedCustomerLastName = r.RelatedCustomer?.Name,
                RelationshipType = r.RelationshipType,
                IsPrimaryContact = r.IsPrimaryContact,
                CreatedAt = r.CreatedAt
            });
        }

        public async Task<CustomerRelationshipDto?> CreateAsync(int customerId, CreateCustomerRelationshipDto dto)
        {
            // Validate that both customers exist
            var customer = await _customerRepository.GetByIdAsync(customerId);
            var relatedCustomer = await _customerRepository.GetByIdAsync(dto.RelatedCustomerId);
            
            if (customer == null || relatedCustomer == null)
                return null;

            // Check if relationship already exists
            var exists = await _repository.RelationshipExistsAsync(customerId, dto.RelatedCustomerId, dto.RelationshipType);
            if (exists)
                return null;

            // Create the primary relationship
            var relationship = new CustomerRelationship
            {
                CustomerId = customerId,
                RelatedCustomerId = dto.RelatedCustomerId,
                RelationshipType = dto.RelationshipType,
                IsPrimaryContact = dto.IsPrimaryContact,
                TenantId = customer.TenantId
            };

            var created = await _repository.CreateAsync(relationship);

            // Create the inverse relationship automatically
            var inverseType = GetInverseRelationshipType(dto.RelationshipType);
            var inverseExists = await _repository.RelationshipExistsAsync(dto.RelatedCustomerId, customerId, inverseType);
            
            if (!inverseExists)
            {
                var inverseRelationship = new CustomerRelationship
                {
                    CustomerId = dto.RelatedCustomerId,
                    RelatedCustomerId = customerId,
                    RelationshipType = inverseType,
                    IsPrimaryContact = false, // Inverse is not primary by default
                    TenantId = customer.TenantId
                };
                await _repository.CreateAsync(inverseRelationship);
            }

            return new CustomerRelationshipDto
            {
                Id = created.Id,
                CustomerId = created.CustomerId,
                CustomerFirstName = customer.FirstName,
                CustomerLastName = customer.Name,
                RelatedCustomerId = created.RelatedCustomerId,
                RelatedCustomerFirstName = relatedCustomer.FirstName,
                RelatedCustomerLastName = relatedCustomer.Name,
                RelationshipType = created.RelationshipType,
                IsPrimaryContact = created.IsPrimaryContact,
                CreatedAt = created.CreatedAt
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            // Get the relationship to find its inverse
            var relationship = await _repository.GetByIdAsync(id);
            if (relationship == null)
                return false;

            // Delete the primary relationship
            var deleted = await _repository.DeleteAsync(id);
            
            if (deleted)
            {
                // Find and delete the inverse relationship
                var inverseType = GetInverseRelationshipType(relationship.RelationshipType);
                var allRelationships = await _repository.GetByCustomerIdAsync(relationship.RelatedCustomerId);
                var inverseRelationship = allRelationships.FirstOrDefault(r => 
                    r.RelatedCustomerId == relationship.CustomerId && 
                    r.RelationshipType == inverseType);
                
                if (inverseRelationship != null)
                {
                    await _repository.DeleteAsync(inverseRelationship.Id);
                }
            }

            return deleted;
        }

        private string GetInverseRelationshipType(string relationshipType)
        {
            return relationshipType switch
            {
                RelationshipType.Parent => RelationshipType.Child,
                RelationshipType.Child => RelationshipType.Parent,
                RelationshipType.Spouse => RelationshipType.Spouse,
                RelationshipType.Sibling => RelationshipType.Sibling,
                RelationshipType.SameHousehold => RelationshipType.SameHousehold,
                _ => relationshipType
            };
        }

        public async Task<bool> IsPrimaryContactAsync(int customerId)
        {
            return await _repository.IsPrimaryContactAsync(customerId);
        }
    }
}
