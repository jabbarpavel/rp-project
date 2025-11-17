namespace RP.CRM.Application.DTOs
{
    public class CustomerTaskDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Status { get; set; } = "offen";
        public DateTime? DueDate { get; set; }
        public int CustomerId { get; set; }
        public string? CustomerName { get; set; }
        public int AssignedToUserId { get; set; }
        public string? AssignedToUserName { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateCustomerTaskDto
    {
        public string Title { get; set; } = string.Empty;
        public string Status { get; set; } = "offen";
        public DateTime? DueDate { get; set; }
        public int CustomerId { get; set; }
        public int AssignedToUserId { get; set; }
    }

    public class UpdateCustomerTaskDto
    {
        public string? Title { get; set; }
        public string? Status { get; set; }
        public DateTime? DueDate { get; set; }
        public int? AssignedToUserId { get; set; }
    }
}
