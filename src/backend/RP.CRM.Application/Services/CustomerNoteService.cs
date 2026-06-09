using RP.CRM.Application.Interfaces;
using RP.CRM.Domain.Entities;

namespace RP.CRM.Application.Services
{
    public class CustomerNoteService : ICustomerNoteService
    {
        private readonly ICustomerNoteRepository _repository;

        public CustomerNoteService(ICustomerNoteRepository repository)
        {
            _repository = repository;
        }

        public Task<CustomerNote?> GetByIdAsync(int id) => _repository.GetByIdAsync(id);

        public Task<IReadOnlyList<CustomerNote>> GetByCustomerIdAsync(int customerId) =>
            _repository.GetByCustomerIdAsync(customerId);

        public Task<CustomerNote> CreateAsync(CustomerNote note) => _repository.CreateAsync(note);

        public Task<CustomerNote?> UpdateAsync(int id, string text, int editorUserId) =>
            _repository.UpdateAsync(id, text, editorUserId);

        public Task<bool> SoftDeleteAsync(int id, int deleterUserId) =>
            _repository.SoftDeleteAsync(id, deleterUserId);

        public Task<IReadOnlyList<CustomerNoteHistory>> GetHistoryAsync(int noteId) =>
            _repository.GetHistoryAsync(noteId);
    }
}
