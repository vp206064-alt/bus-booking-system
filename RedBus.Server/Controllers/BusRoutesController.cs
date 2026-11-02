using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RedBus.Server.Data;
using RedBus.Server.Models;

namespace RedBus.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BusRoutesController : ControllerBase
    {
        private readonly RedBusDbContext _context;

        public BusRoutesController(RedBusDbContext context)
        {
            _context = context;
        }

        // GET: api/busroutes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BusRoute>>> GetBusRoutes()
        {
            return await _context.BusRoutes
                .Include(b => b.Stops) // Added here as well so list views can also access stops if needed
                .ToListAsync();
        }

        // GET: api/busroutes/5 (ADDED: Fetches specific bus route along with Admin-created Stops)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBusRoute(int id)
        {
            var route = await _context.BusRoutes
                .Include(b => b.Stops) // Crucial: This fetches the Admin-created RouteStops
                .FirstOrDefaultAsync(b => b.Id == id);

            if (route == null) return NotFound();
            return Ok(route);
        }

        // GET: api/busroutes/search?source=Mumbai&destination=Jalgaon&date=2026-10-26
        [HttpGet("search")]
        public async Task<IActionResult> SearchBuses(
            [FromQuery] string? source,
            [FromQuery] string? destination,
            [FromQuery] string? date)
        {
            var today = DateTime.Today;
            var maxAllowedDate = today.AddDays(7);

            if (!string.IsNullOrEmpty(date) && DateTime.TryParse(date, out var parsedDate))
            {
                var searchDate = parsedDate.Date;

                // Rule 1: Enforce 7-day rolling window
                if (searchDate < today || searchDate > maxAllowedDate)
                {
                    return BadRequest(new { message = "Bus bookings are only available for today and the next 7 days." });
                }
            }

            var query = _context.BusRoutes.Include(b => b.Stops).AsQueryable();

            if (!string.IsNullOrEmpty(source))
            {
                query = query.Where(b => b.Source.Contains(source));
            }

            if (!string.IsNullOrEmpty(destination))
            {
                query = query.Where(b => b.Destination.Contains(destination));
            }

            if (!string.IsNullOrEmpty(date) && DateTime.TryParse(date, out var validDate))
            {
                query = query.Where(b => b.DepartureTime.Date == validDate.Date);
            }

            var routes = await query.ToListAsync();
            return Ok(routes);
        }

        // GET: api/busroutes/return-search?source=Jalgaon&destination=Mumbai&outboundDate=2026-10-26
        [HttpGet("return-search")]
        public async Task<IActionResult> SearchReturnBuses(
            [FromQuery] string source,
            [FromQuery] string destination,
            [FromQuery] string outboundDate)
        {
            if (!DateTime.TryParse(outboundDate, out var parsedOutboundDate))
            {
                return BadRequest(new { message = "Invalid outbound date format." });
            }

            // Rule 2: Automatic return trip calculation (+2 days / day after tomorrow)
            var expectedReturnDate = parsedOutboundDate.Date.AddDays(2);

            var query = _context.BusRoutes.Include(b => b.Stops).AsQueryable();

            if (!string.IsNullOrEmpty(source))
            {
                query = query.Where(b => b.Source.Contains(source));
            }

            if (!string.IsNullOrEmpty(destination))
            {
                query = query.Where(b => b.Destination.Contains(destination));
            }

            query = query.Where(b => b.DepartureTime.Date == expectedReturnDate);

            var returnRoutes = await query.ToListAsync();

            return Ok(new
            {
                OutboundDate = parsedOutboundDate.ToString("yyyy-MM-dd"),
                ReturnDate = expectedReturnDate.ToString("yyyy-MM-dd"),
                Routes = returnRoutes
            });
        }

        // POST: api/busroutes
        [HttpPost]
        public async Task<ActionResult<BusRoute>> PostBusRoute(BusRoute busRoute)
        {
            _context.BusRoutes.Add(busRoute);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBusRoute), new { id = busRoute.Id }, busRoute);
        }
    }
}