using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RP.CRM.Infrastructure.Data;

namespace RP.CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<HealthController> _logger;

        public HealthController(AppDbContext context, ILogger<HealthController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                // Check database connectivity
                await _context.Database.CanConnectAsync();
                
                return Ok(new
                {
                    status = "healthy",
                    timestamp = DateTime.UtcNow,
                    service = "Kynso CRM API",
                    database = "connected"
                });
            }
            catch (Exception ex)
            {
                // Log the detailed error for diagnostics
                _logger.LogError(ex, "Health check failed: Database connection error");
                
                return StatusCode(503, new
                {
                    status = "unhealthy",
                    timestamp = DateTime.UtcNow,
                    service = "Kynso CRM API",
                    database = "disconnected"
                });
            }
        }
    }
}
