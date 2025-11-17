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
    [Route("api/[controller]")]
    [Authorize]
    public class DocumentsController : ControllerBase
    {
        private readonly IDocumentService _documentService;
        private readonly ICustomerService _customerService;
        private readonly TenantContext _tenantContext;
        private readonly IWebHostEnvironment _environment;

        public DocumentsController(
            IDocumentService documentService,
            ICustomerService customerService,
            TenantContext tenantContext,
            IWebHostEnvironment environment)
        {
            _documentService = documentService;
            _customerService = customerService;
            _tenantContext = tenantContext;
            _environment = environment;
        }

        [HttpGet("customer/{customerId:int}")]
        [RequirePermission(Permission.ViewDocuments)]
        public async Task<IActionResult> GetByCustomerId(int customerId)
        {
            var customer = await _customerService.GetByIdAsync(customerId);
            if (customer == null || customer.TenantId != _tenantContext.TenantId)
                return NotFound();

            var documents = await _documentService.GetByCustomerIdAsync(customerId);
            
            var result = documents.Select(d => new DocumentDto
            {
                Id = d.Id,
                FileName = d.FileName,
                ContentType = d.ContentType,
                FileSize = d.FileSize,
                Category = d.Category,
                CustomerId = d.CustomerId,
                UploadedByUserId = d.UploadedByUserId,
                UploadedByUserName = d.UploadedBy != null ? $"{d.UploadedBy.FirstName} {d.UploadedBy.Name}".Trim() : null,
                UploadedByUserEmail = d.UploadedBy?.Email,
                CreatedAt = d.CreatedAt
            });

            return Ok(result);
        }

        [HttpPost]
        [RequirePermission(Permission.UploadDocuments)]
        public async Task<IActionResult> Upload([FromForm] int customerId, [FromForm] IFormFile file, [FromForm] string? category)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file provided");

            var customer = await _customerService.GetByIdAsync(customerId);
            if (customer == null || customer.TenantId != _tenantContext.TenantId)
                return NotFound("Customer not found");

            // Get user ID from claims
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            // Create uploads directory if it doesn't exist
            var uploadsPath = Path.Combine(_environment.ContentRootPath, "uploads", _tenantContext.TenantId.ToString());
            Directory.CreateDirectory(uploadsPath);

            // Generate unique filename
            var fileExtension = Path.GetExtension(file.FileName);
            var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsPath, uniqueFileName);

            // Save file to disk
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Create document entity
            var document = new Document
            {
                FileName = file.FileName,
                FilePath = filePath,
                ContentType = file.ContentType,
                FileSize = file.Length,
                Category = category,
                CustomerId = customerId,
                UploadedByUserId = userId,
                TenantId = _tenantContext.TenantId
            };

            var created = await _documentService.CreateAsync(document);

            return Ok(new DocumentDto
            {
                Id = created.Id,
                FileName = created.FileName,
                ContentType = created.ContentType,
                FileSize = created.FileSize,
                Category = created.Category,
                CustomerId = created.CustomerId,
                UploadedByUserId = created.UploadedByUserId,
                CreatedAt = created.CreatedAt
            });
        }

        [HttpGet("{id:int}/download")]
        [RequirePermission(Permission.ViewDocuments)]
        public async Task<IActionResult> Download(int id)
        {
            var document = await _documentService.GetByIdAsync(id);
            if (document == null || document.TenantId != _tenantContext.TenantId)
                return NotFound();

            if (!System.IO.File.Exists(document.FilePath))
                return NotFound("File not found on server");

            var memory = new MemoryStream();
            using (var stream = new FileStream(document.FilePath, FileMode.Open))
            {
                await stream.CopyToAsync(memory);
            }
            memory.Position = 0;

            return File(memory, document.ContentType, document.FileName);
        }

        [HttpDelete("{id:int}")]
        [RequirePermission(Permission.DeleteDocuments)]
        public async Task<IActionResult> Delete(int id)
        {
            var document = await _documentService.GetByIdAsync(id);
            if (document == null || document.TenantId != _tenantContext.TenantId)
                return NotFound();

            // Delete file from disk
            if (System.IO.File.Exists(document.FilePath))
            {
                System.IO.File.Delete(document.FilePath);
            }

            var deleted = await _documentService.DeleteAsync(id);
            return deleted ? NoContent() : NotFound();
        }
    }
}
