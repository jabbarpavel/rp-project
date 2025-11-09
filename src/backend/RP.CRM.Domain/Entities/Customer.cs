namespace RP.CRM.Domain.Entities
{
    public class Customer : BaseEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        public int TenantId { get; set; }
        public Tenant? Tenant { get; set; }
    }
}
