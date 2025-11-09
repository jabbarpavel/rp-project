using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace RP.CRM.Domain.Entities
{
    public class Tenant : BaseEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;

        // neue Spalte für Subdomain-Zuordnung
        public string Domain { get; set; } = string.Empty;

        [JsonIgnore]
        public ICollection<Customer> Customers { get; set; } = new List<Customer>();

        [JsonIgnore]
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}
