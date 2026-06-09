using Microsoft.EntityFrameworkCore;
using RP.CRM.Application.Interfaces;
using RP.CRM.Domain.Entities;
using RP.CRM.Infrastructure.Context;
using RP.CRM.Infrastructure.Data;

namespace RP.CRM.Infrastructure.Repositories
{
    public class CustomerNoteRepository : ICustomerNoteRepository
    {
        private readonly AppDbContext _context;
        private readonly TenantContext _tenantContext;

        public CustomerNoteRepository(AppDbContext context, TenantContext tenantContext)
        {
            _context = context;
            _tenantContext = tenantContext;
        }

        public async Task<CustomerNote?> GetByIdAsync(int id)
        {
            return await _context.CustomerNotes
                .Include(n => n.CreatedByUser)
                .Include(n => n.UpdatedByUser)
                .FirstOrDefaultAsync(n =>
                    n.Id == id &&
                    n.TenantId == _tenantContext.TenantId &&
                    !n.IsDeleted);
        }

        public async Task<IReadOnlyList<CustomerNote>> GetByCustomerIdAsync(int customerId)
        {
            return await _context.CustomerNotes
                .Include(n => n.CreatedByUser)
                .Include(n => n.UpdatedByUser)
                .Include(n => n.History)
                .Where(n =>
                    n.CustomerId == customerId &&
                    n.TenantId == _tenantContext.TenantId &&
                    !n.IsDeleted)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<CustomerNote> CreateAsync(CustomerNote note)
        {
            _context.CustomerNotes.Add(note);
            await _context.SaveChangesAsync();

            // Re-load with CreatedByUser navigation so the caller can map to DTO.
            await _context.Entry(note).Reference(n => n.CreatedByUser).LoadAsync();
            return note;
        }

        public async Task<CustomerNote?> UpdateAsync(int id, string text, int editorUserId)
        {
            var note = await _context.CustomerNotes
                .FirstOrDefaultAsync(n =>
                    n.Id == id &&
                    n.TenantId == _tenantContext.TenantId &&
                    !n.IsDeleted);
            if (note == null)
                return null;

            // Archive previous version before overwriting.
            var historyEntry = new CustomerNoteHistory
            {
                CustomerNoteId = note.Id,
                Text = note.Text,
                EditedByUserId = editorUserId,
                EditedAt = DateTime.UtcNow,
                TenantId = note.TenantId
            };
            _context.CustomerNoteHistories.Add(historyEntry);

            note.Text = text;
            note.UpdatedByUserId = editorUserId;

            await _context.SaveChangesAsync();

            await _context.Entry(note).Reference(n => n.CreatedByUser).LoadAsync();
            await _context.Entry(note).Reference(n => n.UpdatedByUser).LoadAsync();
            await _context.Entry(note).Collection(n => n.History).LoadAsync();
            return note;
        }

        public async Task<bool> SoftDeleteAsync(int id, int deleterUserId)
        {
            var note = await _context.CustomerNotes
                .FirstOrDefaultAsync(n =>
                    n.Id == id &&
                    n.TenantId == _tenantContext.TenantId &&
                    !n.IsDeleted);
            if (note == null)
                return false;

            note.IsDeleted = true;
            note.DeletedAt = DateTime.UtcNow;
            note.DeletedByUserId = deleterUserId;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IReadOnlyList<CustomerNoteHistory>> GetHistoryAsync(int noteId)
        {
            return await _context.CustomerNoteHistories
                .Include(h => h.EditedByUser)
                .Where(h =>
                    h.CustomerNoteId == noteId &&
                    h.TenantId == _tenantContext.TenantId)
                .OrderByDescending(h => h.EditedAt)
                .ToListAsync();
        }
    }
}
