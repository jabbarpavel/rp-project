namespace RP.CRM.Application.DTOs
{
    public class TenantDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Domain { get; set; } = string.Empty;   // hinzugefügt
    }

    public class CreateTenantDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Domain { get; set; }                  // hinzugefügt
    }
}
