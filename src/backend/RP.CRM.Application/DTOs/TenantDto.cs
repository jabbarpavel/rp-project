namespace RP.CRM.Application.DTOs
{
    public class TenantDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Domain { get; set; } = string.Empty;
        public string? LogoData { get; set; }
    }

    public class CreateTenantDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Domain { get; set; }
    }

    public class UpdateTenantLogoDto
    {
        public string LogoData { get; set; } = string.Empty;
    }
}
