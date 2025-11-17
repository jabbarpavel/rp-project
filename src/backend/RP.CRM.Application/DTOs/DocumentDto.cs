using System;

namespace RP.CRM.Application.DTOs
{
    public class DocumentDto
    {
        public int Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string? Category { get; set; }
        public int CustomerId { get; set; }
        public int UploadedByUserId { get; set; }
        public string? UploadedByUserName { get; set; }
        public string? UploadedByUserEmail { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateDocumentDto
    {
        public int CustomerId { get; set; }
        public string? Category { get; set; }
    }
}
