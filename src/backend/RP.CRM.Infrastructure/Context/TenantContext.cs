namespace RP.CRM.Infrastructure.Context
{
    public class TenantContext
    {
        public int TenantId { get; private set; }

        public TenantContext() { }

        public void SetTenant(int tenantId)
        {
            TenantId = tenantId;
        }
    }
}
