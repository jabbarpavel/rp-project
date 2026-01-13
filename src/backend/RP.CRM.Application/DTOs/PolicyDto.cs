using System;
using RP.CRM.Domain.Enums;

namespace RP.CRM.Application.DTOs
{
    public class PolicyDto
    {
        public int Id { get; set; }
        public string PolicyNumber { get; set; } = string.Empty;
        public PolicyType Type { get; set; }
        public string TypeDisplay { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string OrganizationalUnit { get; set; } = string.Empty;
        public string? ProductName { get; set; }
        public MutationReason? MutationReason { get; set; }
        public string? MutationReasonDisplay { get; set; }
        public string? CustomerNumber { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public PaymentFrequency? PaymentFrequency { get; set; }
        public string? PaymentFrequencyDisplay { get; set; }
        public decimal? AnnualPremium { get; set; }
        public string? Advisor { get; set; }
        public string? Status { get; set; }
        public int? DocumentId { get; set; }
        public string? DocumentFileName { get; set; }
        public int CustomerId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreatePolicyDto
    {
        public string PolicyNumber { get; set; } = string.Empty;
        public PolicyType Type { get; set; }
        public string Company { get; set; } = string.Empty;
        public string OrganizationalUnit { get; set; } = string.Empty;
        public string? ProductName { get; set; }
        public MutationReason? MutationReason { get; set; }
        public string? CustomerNumber { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public PaymentFrequency? PaymentFrequency { get; set; }
        public decimal? AnnualPremium { get; set; }
        public string? Advisor { get; set; }
        public string? Status { get; set; }
        public int? DocumentId { get; set; }
        public int CustomerId { get; set; }
    }

    public class UpdatePolicyDto
    {
        public string PolicyNumber { get; set; } = string.Empty;
        public PolicyType Type { get; set; }
        public string Company { get; set; } = string.Empty;
        public string OrganizationalUnit { get; set; } = string.Empty;
        public string? ProductName { get; set; }
        public MutationReason? MutationReason { get; set; }
        public string? CustomerNumber { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public PaymentFrequency? PaymentFrequency { get; set; }
        public decimal? AnnualPremium { get; set; }
        public string? Advisor { get; set; }
        public string? Status { get; set; }
        public int? DocumentId { get; set; }
    }
}
