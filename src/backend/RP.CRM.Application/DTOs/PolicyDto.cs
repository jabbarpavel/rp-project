using System;
using RP.CRM.Domain.Enums;

namespace RP.CRM.Application.DTOs
{
    public class PolicyDto
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public string PolicyNumber { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? OrganizationalUnit { get; set; }
        public int? AdvisorUserId { get; set; }
        public string? AdvisorName { get; set; }
        public PolicyStatus Status { get; set; }
        public string StatusLabel { get; set; } = string.Empty;

        public string? DocumentFileName { get; set; }
        public string? DocumentContentType { get; set; }
        public long? DocumentFileSize { get; set; }
        public bool HasDocument { get; set; }

        public int CreatedByUserId { get; set; }
        public string? CreatedByUserName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreatePolicyDto
    {
        public string PolicyNumber { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? OrganizationalUnit { get; set; }
        public int? AdvisorUserId { get; set; }
        public PolicyStatus Status { get; set; } = PolicyStatus.Active;
    }
}
