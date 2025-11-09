using Microsoft.AspNetCore.Mvc;
using RP.CRM.Application.DTOs;
using RP.CRM.Application.Interfaces;
using System.ComponentModel.DataAnnotations;

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

        public class RegisterRequest
        {
            [Required, EmailAddress]
            public string Email { get; set; } = string.Empty;

            [Required, MinLength(6)]
            public string Password { get; set; } = string.Empty;

            [Required]
            public int TenantId { get; set; }
        }

        public class LoginRequest
        {
            [Required, EmailAddress]
            public string Email { get; set; } = string.Empty;

            [Required]
            public string Password { get; set; } = string.Empty;
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
                TenantId = user.TenantId 
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Tenant aus Subdomain ableiten
            var host = HttpContext.Request.Host.Host.ToLower();
            var subdomain = host.Split('.')[0];

            var tenants = await _tenantService.GetAllAsync();
            var tenant = tenants.FirstOrDefault(t => 
                t.Name.ToLower() == subdomain || 
                t.Domain.ToLower() == subdomain);

            if (tenant == null)
                return BadRequest($"Unknown tenant for subdomain '{subdomain}'.");

            // Tenant-Kontext global verfügbar machen (z. B. für Repository)
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
    }
}
