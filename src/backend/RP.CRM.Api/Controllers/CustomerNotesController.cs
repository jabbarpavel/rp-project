using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RP.CRM.Application.DTOs;
using RP.CRM.Application.Interfaces;
using RP.CRM.Domain.Entities;
using RP.CRM.Domain.Enums;
using RP.CRM.Infrastructure.Authorization;
using RP.CRM.Infrastructure.Context;
using System.Security.Claims;

namespace RP.CRM.Api.Controllers
{
    [ApiController]
    [Route("api/customer/{customerId:int}/notes")]
    [Authorize]
    public class CustomerNotesController : ControllerBase
    {
        private const int MinNoteLength = 10;

        private readonly ICustomerNoteService _noteService;
        private readonly ICustomerService _customerService;
        private readonly TenantContext _tenantContext;

        public CustomerNotesController(
            ICustomerNoteService noteService,
            ICustomerService customerService,
            TenantContext tenantContext)
        {
            _noteService = noteService;
            _customerService = customerService;
            _tenantContext = tenantContext;
        }

        private static string? FullName(User? u) =>
            u == null ? null : $"{u.FirstName} {u.Name}".Trim();

        private static CustomerNoteDto MapToDto(CustomerNote n) => new()
        {
            Id = n.Id,
            CustomerId = n.CustomerId,
            Text = n.Text,
            CreatedByUserId = n.CreatedByUserId,
            CreatedByUserName = FullName(n.CreatedByUser),
            CreatedAt = n.CreatedAt,
            UpdatedAt = n.UpdatedAt,
            UpdatedByUserId = n.UpdatedByUserId,
            UpdatedByUserName = FullName(n.UpdatedByUser),
            HasHistory = n.History != null && n.History.Count > 0
        };

        private static CustomerNoteHistoryDto MapHistoryToDto(CustomerNoteHistory h) => new()
        {
            Id = h.Id,
            CustomerNoteId = h.CustomerNoteId,
            Text = h.Text,
            EditedByUserId = h.EditedByUserId,
            EditedByUserName = FullName(h.EditedByUser),
            EditedAt = h.EditedAt
        };

        private int? GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(claim) || !int.TryParse(claim, out var id))
                return null;
            return id;
        }

        [HttpGet]
        [RequirePermission(Permission.ViewCustomers)]
        public async Task<IActionResult> GetAll(int customerId)
        {
            var customer = await _customerService.GetByIdAsync(customerId);
            if (customer == null || customer.TenantId != _tenantContext.TenantId)
                return NotFound();

            var notes = await _noteService.GetByCustomerIdAsync(customerId);
            return Ok(notes.Select(MapToDto));
        }

        [HttpGet("{noteId:int}/history")]
        [RequirePermission(Permission.ViewCustomers)]
        public async Task<IActionResult> GetHistory(int customerId, int noteId)
        {
            var note = await _noteService.GetByIdAsync(noteId);
            if (note == null || note.CustomerId != customerId)
                return NotFound();

            var history = await _noteService.GetHistoryAsync(noteId);
            return Ok(history.Select(MapHistoryToDto));
        }

        [HttpPost]
        [RequirePermission(Permission.ViewCustomers)]
        public async Task<IActionResult> Create(int customerId, [FromBody] CreateCustomerNoteDto dto)
        {
            var customer = await _customerService.GetByIdAsync(customerId);
            if (customer == null || customer.TenantId != _tenantContext.TenantId)
                return NotFound();

            var text = (dto?.Text ?? string.Empty).Trim();
            if (text.Length < MinNoteLength)
                return BadRequest($"Notiz muss mindestens {MinNoteLength} Zeichen lang sein.");

            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var note = new CustomerNote
            {
                CustomerId = customerId,
                Text = text,
                CreatedByUserId = userId.Value
            };

            var created = await _noteService.CreateAsync(note);
            return Ok(MapToDto(created));
        }

        [HttpPut("{noteId:int}")]
        [RequirePermission(Permission.DeleteCustomers)]
        public async Task<IActionResult> Update(int customerId, int noteId, [FromBody] UpdateCustomerNoteDto dto)
        {
            var existing = await _noteService.GetByIdAsync(noteId);
            if (existing == null || existing.CustomerId != customerId)
                return NotFound();

            var text = (dto?.Text ?? string.Empty).Trim();
            if (text.Length < MinNoteLength)
                return BadRequest($"Notiz muss mindestens {MinNoteLength} Zeichen lang sein.");

            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var updated = await _noteService.UpdateAsync(noteId, text, userId.Value);
            if (updated == null)
                return NotFound();

            return Ok(MapToDto(updated));
        }

        [HttpDelete("{noteId:int}")]
        [RequirePermission(Permission.DeleteCustomers)]
        public async Task<IActionResult> Delete(int customerId, int noteId)
        {
            var note = await _noteService.GetByIdAsync(noteId);
            if (note == null || note.CustomerId != customerId)
                return NotFound();

            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var ok = await _noteService.SoftDeleteAsync(noteId, userId.Value);
            if (!ok)
                return NotFound();

            return NoContent();
        }
    }
}
