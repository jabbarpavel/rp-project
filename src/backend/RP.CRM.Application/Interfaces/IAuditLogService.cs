using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RP.CRM.Domain.Entities;

namespace RP.CRM.Application.Interfaces
{
    public interface IAuditLogService
    {
        Task LogAsync(ChangeLog log);

        // neue Methode für automatisches Auslesen aus dem ChangeTracker
        Task CaptureEntityChangesAsync(DbContext dbContext, string changedBy = "system");
    }
}
