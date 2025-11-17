using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RP.CRM.Application.Interfaces;
using RP.CRM.Infrastructure.Context;
using System.Security.Claims;

namespace RP.CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly ICustomerService _customerService;
        private readonly ICustomerTaskService _taskService;
        private readonly TenantContext _tenantContext;

        public DashboardController(
            ICustomerService customerService,
            ICustomerTaskService taskService,
            TenantContext tenantContext)
        {
            _customerService = customerService;
            _taskService = taskService;
            _tenantContext = tenantContext;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var allCustomers = await _customerService.GetAllAsync();
            var myCustomers = allCustomers.Where(c => c.AdvisorId == userId && !c.IsDeleted).ToList();
            
            var openTasks = await _taskService.GetOpenTasksByUserIdAsync(userId);

            return Ok(new
            {
                customerCount = myCustomers.Count,
                openTasksCount = openTasks.Count,
                openTasks = openTasks.Select(t => new
                {
                    t.Id,
                    t.Title,
                    t.Status,
                    t.DueDate,
                    t.CustomerId,
                    CustomerName = t.Customer != null ? $"{t.Customer.FirstName} {t.Customer.Name}".Trim() : null
                }).ToList()
            });
        }
    }
}
