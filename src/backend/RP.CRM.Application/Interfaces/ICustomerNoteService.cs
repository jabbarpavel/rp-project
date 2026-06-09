using RP.CRM.Domain.Entities;

namespace RP.CRM.Application.Interfaces
{
    public interface ICustomerNoteService
    {
        Task<CustomerNote?> GetByIdAsync(int id);
        Task<IReadOnlyList<CustomerNote>> GetByCustomerIdAsync(int customerId);
        Task<CustomerNote> CreateAsync(CustomerNote note);
        Task<CustomerNote?> UpdateAsync(int id, string text, int editorUserId);
        Task<bool> SoftDeleteAsync(int id, int deleterUserId);
        Task<IReadOnlyList<CustomerNoteHistory>> GetHistoryAsync(int noteId);
    }
}
