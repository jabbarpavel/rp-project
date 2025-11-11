namespace RP.CRM.Domain.Entities
{
    public class Customer : BaseEntity
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string AHVNum { get; set; } = string.Empty; // neu, Pflichtfeld

        public int TenantId { get; set; }
        public Tenant? Tenant { get; set; }

        public bool IsDeleted { get; set; }
    }
}
