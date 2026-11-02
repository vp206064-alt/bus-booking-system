using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RedBus.Server.Data;
using RedBus.Server.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RedBus.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly RedBusDbContext _context;

        public AdminController(RedBusDbContext context)
        {
            _context = context;
        }

        // POST: api/admin/add-route
        [HttpPost("add-route")]
        public async Task<IActionResult> AddBusRoute([FromBody] BusRouteDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.BusName) || string.IsNullOrWhiteSpace(dto.Source) || string.IsNullOrWhiteSpace(dto.Destination))
            {
                return BadRequest(new { message = "Bus Name, Source, and Destination are required." });
            }

            // Combine Departure Date and Time into a proper DateTime
            DateTime departure;
            if (!DateTime.TryParse($"{dto.DepartureDate} {dto.DepartureTime}", out departure))
            {
                departure = DateTime.Now; // Fallback
            }

            var route = new BusRoute
            {
                BusName = dto.BusName,
                Source = dto.Source,
                Destination = dto.Destination,
                DepartureTime = departure,
                Fare = dto.Fare > 0 ? dto.Fare : 450,
                TotalSeats = dto.TotalSeats > 0 ? dto.TotalSeats : 20,
                Stops = new List<RouteStop>()
            };

            // Map and add Boarding Points
            if (dto.BoardingPoints != null)
            {
                foreach (var bp in dto.BoardingPoints)
                {
                    if (!string.IsNullOrWhiteSpace(bp.Name))
                    {
                        route.Stops.Add(new RouteStop
                        {
                            StopName = bp.Name,
                            StopTime = bp.Time,
                            Type = "Boarding"
                        });
                    }
                }
            }

            // Map and add Dropping Points
            if (dto.DroppingPoints != null)
            {
                foreach (var dp in dto.DroppingPoints)
                {
                    if (!string.IsNullOrWhiteSpace(dp.Name))
                    {
                        route.Stops.Add(new RouteStop
                        {
                            StopName = dp.Name,
                            StopTime = dp.Time,
                            Type = "Dropping"
                        });
                    }
                }
            }

            _context.BusRoutes.Add(route);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Bus route with custom stops added successfully!", routeId = route.Id });
        }

        // GET: api/admin/all-bookings
        [HttpGet("all-bookings")]
        public async Task<IActionResult> GetAllBookings()
        {
            var bookings = await (from b in _context.Bookings
                                  join r in _context.BusRoutes on b.BusRouteId equals r.Id
                                  select new
                                  {
                                      b.Id,
                                      b.PassengerName,
                                      b.TotalFare,
                                      b.BookingDate,
                                      BusName = r.BusName,
                                      Source = r.Source,
                                      Destination = r.Destination,
                                      DepartureTime = r.DepartureTime,
                                      SeatNumbers = _context.BookedSeats
                                          .Where(bs => bs.BookingId == b.Id)
                                          .Select(bs => bs.SeatNumber)
                                          .ToList()
                                  }).ToListAsync();

            return Ok(bookings);
        }

        // DELETE: api/admin/delete-booking/{id}
        [HttpDelete("delete-booking/{id}")]
        public async Task<IActionResult> DeleteBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
            {
                return NotFound(new { message = "Booking record not found in backend." });
            }

            var bookedSeats = await _context.BookedSeats
                .Where(bs => bs.BookingId == id)
                .ToListAsync();

            string seatsFreed = string.Join(", ", bookedSeats.Select(s => s.SeatNumber));

            _context.BookedSeats.RemoveRange(bookedSeats);
            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Ticket cancelled successfully! Seats ({seatsFreed}) have been removed from backend and freed for booking."
            });
        }
    }

    public class BusRouteDto
    {
        public string BusName { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public string Destination { get; set; } = string.Empty;
        public string DepartureDate { get; set; } = string.Empty;
        public string DepartureTime { get; set; } = string.Empty;
        public decimal Fare { get; set; }
        public int TotalSeats { get; set; }
        public List<StopDto> BoardingPoints { get; set; } = new List<StopDto>();
        public List<StopDto> DroppingPoints { get; set; } = new List<StopDto>();
    }

    public class StopDto
    {
        public string Name { get; set; } = string.Empty;
        public string Time { get; set; } = string.Empty;
    }
}