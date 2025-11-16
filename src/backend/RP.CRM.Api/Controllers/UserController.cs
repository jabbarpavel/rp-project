using Microsoft.AspNetCore.Mvc;
using RP.CRM.Application.DTOs;
using RP.CRM.Application.Interfaces;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;

namespace RP.CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ITenantService _tenantService;

        public UserController(IUserService userService, ITenantService tenantService)
        {
            _userService = userService;
            _tenantService = tenantService;
        }

        // ===== REGISTER =====
        public class RegisterRequest
        {
            [Required, EmailAddress]
            public string Email { get; set; } = string.Empty;

            [Required, MinLength(6)]
            public string Password { get; set; } = string.Empty;

            [Required]
            public int TenantId { get; set; }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userService.RegisterAsync(request.Email, request.Password, request.TenantId);
            if (user == null)
                return BadRequest("User already exists.");

            return Ok(new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                TenantId = user.TenantId,
                FirstName = user.FirstName,
                Name = user.Name,
                Phone = user.Phone,
                IsActive = user.IsActive
            });
        }

        // ===== LOGIN =====
        public class LoginRequest
        {
            [Required, EmailAddress]
            public string Email { get; set; } = string.Empty;

            [Required]
            public string Password { get; set; } = string.Empty;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var host = HttpContext.Request.Host.Host.ToLower();
            var subdomain = host.Split('.')[0];

            var tenants = await _tenantService.GetAllAsync();
            var tenant = tenants.FirstOrDefault(t =>
                t.Name.ToLower() == subdomain ||
                t.Domain.ToLower() == subdomain);

            if (tenant == null)
                return BadRequest($"Unknown tenant for subdomain '{subdomain}'.");

            AppContext.SetData("RequestTenantId", tenant.Id);

            var token = await _userService.LoginAsync(request.Email, request.Password);
            if (token == null)
                return Unauthorized("Invalid credentials.");

            return Ok(new
            {
                Token = token,
                TenantId = tenant.Id,
                TenantName = tenant.Name
            });
        }

        // ===== GET ADVISORS =====
        [HttpGet("advisors")]
        [Authorize]
        public async Task<IActionResult> GetAdvisors([FromQuery] string? q)
        {
            var list = await _userService.GetAdvisorsAsync(q);
            var result = list.Select(u => new UserDto
            {
                Id = u.Id,
                Email = u.Email,
                TenantId = u.TenantId,
                FirstName = u.FirstName,
                Name = u.Name,
                Phone = u.Phone,
                IsActive = u.IsActive
            });
            return Ok(result);
        }

        // ===== GET BY ID =====
        [HttpGet("{id:int}")]
        [Authorize]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null) return NotFound();

            return Ok(new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                TenantId = user.TenantId,
                FirstName = user.FirstName,
                Name = user.Name,
                Phone = user.Phone,
                IsActive = user.IsActive
            });
        }

        // ===== UPDATE USER =====
        public class UpdateUserRequest
        {
            public string? FirstName { get; set; }
            public string? Name { get; set; }
            public string? Phone { get; set; }
            public bool? IsActive { get; set; }
        }

        [HttpPut("{id:int}")]
        [Authorize]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
        {
            var updated = await _userService.UpdateUserAsync(id, request.FirstName, request.Name, request.Phone, request.IsActive);
            if (updated == null) return NotFound("User not found.");

            return Ok(new UserDto
            {
                Id = updated.Id,
                Email = updated.Email,
                TenantId = updated.TenantId,
                FirstName = updated.FirstName,
                Name = updated.Name,
                Phone = updated.Phone,
                IsActive = updated.IsActive
            });
        }
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                            ?? User.FindFirst("sub")?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized("Invalid token.");

            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
                return NotFound("User not found.");

            return Ok(new 
            {
                user.Id,
                user.Email,
                user.FirstName,
                user.Name,
                user.Phone,
                user.IsActive,
                user.Role,
                user.TenantId,
                user.CreatedAt,
                user.UpdatedAt,
                TenantName = user.Tenant?.Name ?? "(unbekannt)"
            });
        }
        public class UpdateSelfDto
        {
            public string? FirstName { get; set; }
            public string? Name { get; set; }
            public string? Phone { get; set; }
        }

        [HttpPut("me")]
        [Authorize]
        public async Task<IActionResult> UpdateCurrentUser([FromBody] UpdateSelfDto dto)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                            ?? User.FindFirst("sub")?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized("Invalid token.");

            var updated = await _userService.UpdateUserAsync(userId, dto.FirstName, dto.Name, dto.Phone, null);
            if (updated == null)
                return NotFound("User not found.");

            return Ok(new 
            {
                updated.Id,
                updated.Email,
                updated.FirstName,
                updated.Name,
                updated.Phone,
                updated.IsActive
            });
        }

    }
}
