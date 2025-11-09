using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Identity;
using RP.CRM.Application.Interfaces;
using RP.CRM.Domain.Entities;

namespace RP.CRM.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _repository;
        private readonly IConfiguration _config;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly ILogger<UserService> _logger;

        public UserService(
            IUserRepository repository,
            IConfiguration config,
            ILogger<UserService> logger)
        {
            _repository = repository;
            _config = config;
            _logger = logger;
            _passwordHasher = new PasswordHasher<User>();
        }

        public async Task<User?> RegisterAsync(string email, string password, int tenantId)
        {
            _logger.LogInformation("Register attempt for {Email} (Tenant {TenantId})", email, tenantId);

            var existing = await _repository.GetByEmailAndTenantAsync(email, tenantId);
            if (existing != null)
            {
                _logger.LogWarning("Registration failed: User {Email} already exists for Tenant {TenantId}", email, tenantId);
                return null;
            }

            var user = new User
            {
                Email = email,
                TenantId = tenantId
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, password);
            var created = await _repository.CreateAsync(user);

            _logger.LogInformation("User {Email} successfully registered with ID {Id}", email, created.Id);
            return created;
        }

        public async Task<string?> LoginAsync(string email, string password)
        {
            var tenantId = (int?)AppContext.GetData("RequestTenantId") ?? 0;
            _logger.LogInformation("Login attempt for {Email} (Tenant {TenantId})", email, tenantId);

            var user = tenantId > 0
                ? await _repository.GetByEmailAndTenantAsync(email, tenantId)
                : await _repository.GetByEmailAsync(email);

            if (user == null)
            {
                _logger.LogWarning("Login failed: User {Email} not found (Tenant {TenantId})", email, tenantId);
                return null;
            }

            var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, password);
            if (result == PasswordVerificationResult.Failed)
            {
                _logger.LogWarning("Login failed: Invalid password for {Email}", email);
                return null;
            }

            _logger.LogInformation("Login success for {Email} (Tenant {TenantId})", email, tenantId);

            var key = _config["Jwt:Key"] ?? "your_super_secret_key_here";
            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim("tenantId", user.TenantId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("role", user.Role ?? "user"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: "RP.CRM.Api",
                audience: "RP.CRM.Client",
                claims: claims,
                expires: DateTime.UtcNow.AddHours(6),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<User?> GetByEmailAndTenantAsync(string email, int tenantId)
        {
            return await _repository.GetByEmailAndTenantAsync(email, tenantId);
        }
    }
}
