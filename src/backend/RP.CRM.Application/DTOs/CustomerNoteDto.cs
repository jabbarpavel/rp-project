namespace RP.CRM.Application.DTOs
{
    public class CustomerNoteDto
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public string Text { get; set; } = string.Empty;
        public int CreatedByUserId { get; set; }
        public string? CreatedByUserName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedByUserId { get; set; }
        public string? UpdatedByUserName { get; set; }
        public bool HasHistory { get; set; }
    }

    public class CreateCustomerNoteDto
    {
        public string Text { get; set; } = string.Empty;
    }

    public class UpdateCustomerNoteDto
    {
        public string Text { get; set; } = string.Empty;
    }

    public class CustomerNoteHistoryDto
    {
        public int Id { get; set; }
        public int CustomerNoteId { get; set; }
        public string Text { get; set; } = string.Empty;
        public int EditedByUserId { get; set; }
        public string? EditedByUserName { get; set; }
        public DateTime EditedAt { get; set; }
    }
}
