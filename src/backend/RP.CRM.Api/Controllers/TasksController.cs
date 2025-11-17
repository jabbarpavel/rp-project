using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RP.CRM.Application.DTOs;
using RP.CRM.Application.Interfaces;
using RP.CRM.Domain.Entities;
using RP.CRM.Domain.Enums;
using RP.CRM.Infrastructure.Authorization;
using RP.CRM.Infrastructure.Context;
using System.Security.Claims;

namespace RP.CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly ICustomerTaskService _taskService;
        private readonly ICustomerService _customerService;
        private readonly TenantContext _tenantContext;

        public TasksController(
            ICustomerTaskService taskService,
            ICustomerService customerService,
            TenantContext tenantContext)
        {
            _taskService = taskService;
            _customerService = customerService;
            _tenantContext = tenantContext;
        }

        [HttpGet("customer/{customerId:int}")]
        [RequirePermission(Permission.ViewCustomers)]
        public async Task<IActionResult> GetByCustomer(int customerId)
        {
            var customer = await _customerService.GetByIdAsync(customerId);
            if (customer == null || customer.TenantId != _tenantContext.TenantId)
                return NotFound();

            var tasks = await _taskService.GetByCustomerIdAsync(customerId);
            
            var result = tasks.Select(t => new CustomerTaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Status = t.Status,
                DueDate = t.DueDate,
                CustomerId = t.CustomerId,
                CustomerName = t.Customer != null ? $"{t.Customer.FirstName} {t.Customer.Name}".Trim() : null,
                AssignedToUserId = t.AssignedToUserId,
                AssignedToUserName = t.AssignedToUser != null ? $"{t.AssignedToUser.FirstName} {t.AssignedToUser.Name}".Trim() : null,
                CreatedAt = t.CreatedAt
            });

            return Ok(result);
        }

        [HttpGet("my-tasks")]
        public async Task<IActionResult> GetMyTasks()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var tasks = await _taskService.GetByAssignedUserIdAsync(userId);
            
            var result = tasks.Select(t => new CustomerTaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Status = t.Status,
                DueDate = t.DueDate,
                CustomerId = t.CustomerId,
                CustomerName = t.Customer != null ? $"{t.Customer.FirstName} {t.Customer.Name}".Trim() : null,
                AssignedToUserId = t.AssignedToUserId,
                AssignedToUserName = t.AssignedToUser != null ? $"{t.AssignedToUser.FirstName} {t.AssignedToUser.Name}".Trim() : null,
                CreatedAt = t.CreatedAt
            });

            return Ok(result);
        }

        [HttpGet("my-open-tasks")]
        public async Task<IActionResult> GetMyOpenTasks()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var tasks = await _taskService.GetOpenTasksByUserIdAsync(userId);
            
            var result = tasks.Select(t => new CustomerTaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Status = t.Status,
                DueDate = t.DueDate,
                CustomerId = t.CustomerId,
                CustomerName = t.Customer != null ? $"{t.Customer.FirstName} {t.Customer.Name}".Trim() : null,
                AssignedToUserId = t.AssignedToUserId,
                AssignedToUserName = t.AssignedToUser != null ? $"{t.AssignedToUser.FirstName} {t.AssignedToUser.Name}".Trim() : null,
                CreatedAt = t.CreatedAt
            });

            return Ok(result);
        }

        [HttpPost]
        [RequirePermission(Permission.ViewCustomers)]
        public async Task<IActionResult> Create([FromBody] CreateCustomerTaskDto dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var customer = await _customerService.GetByIdAsync(dto.CustomerId);
            if (customer == null || customer.TenantId != _tenantContext.TenantId)
                return NotFound("Customer not found");

            var task = new CustomerTask
            {
                Title = dto.Title,
                Status = dto.Status,
                DueDate = dto.DueDate,
                CustomerId = dto.CustomerId,
                AssignedToUserId = dto.AssignedToUserId,
                TenantId = _tenantContext.TenantId
            };

            var created = await _taskService.CreateAsync(task);

            return Ok(new CustomerTaskDto
            {
                Id = created.Id,
                Title = created.Title,
                Status = created.Status,
                DueDate = created.DueDate,
                CustomerId = created.CustomerId,
                AssignedToUserId = created.AssignedToUserId,
                CreatedAt = created.CreatedAt
            });
        }

        [HttpPut("{id:int}")]
        [RequirePermission(Permission.ViewCustomers)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCustomerTaskDto dto)
        {
            var task = await _taskService.GetByIdAsync(id);
            if (task == null || task.TenantId != _tenantContext.TenantId)
                return NotFound();

            if (dto.Title != null) task.Title = dto.Title;
            if (dto.Status != null) task.Status = dto.Status;
            if (dto.DueDate.HasValue) task.DueDate = dto.DueDate;
            if (dto.AssignedToUserId.HasValue) task.AssignedToUserId = dto.AssignedToUserId.Value;

            var updated = await _taskService.UpdateAsync(task);

            return Ok(new CustomerTaskDto
            {
                Id = updated.Id,
                Title = updated.Title,
                Status = updated.Status,
                DueDate = updated.DueDate,
                CustomerId = updated.CustomerId,
                AssignedToUserId = updated.AssignedToUserId,
                CreatedAt = updated.CreatedAt
            });
        }

        [HttpDelete("{id:int}")]
        [RequirePermission(Permission.ViewCustomers)]
        public async Task<IActionResult> Delete(int id)
        {
            var task = await _taskService.GetByIdAsync(id);
            if (task == null || task.TenantId != _tenantContext.TenantId)
                return NotFound();

            await _taskService.DeleteAsync(id);
            return NoContent();
        }
    }
}
