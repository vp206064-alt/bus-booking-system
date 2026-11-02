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
    public class BookingsController : ControllerBase
    {
        private readonly RedBusDbContext _context;

        public BookingsController(RedBusDbContext context)
        {
            _context = context;
        }

        // GET: api/bookings/bus/{busRouteId}
        [HttpGet("bus/{busRouteId}")]
        [HttpGet("{busRouteId}")]
        [HttpGet("booked-seats/{busRouteId}")]
        public async Task<IActionResult> GetBookedSeats(int busRouteId)
        {
            var bookedSeatsInt = await _context.BookedSeats
                .Where(bs => bs.BusRouteId == busRouteId)
                .Select(bs => bs.SeatNumber)
                .ToListAsync();

            // Convert integer seat numbers to strings for the frontend (e.g., "1", "4")
            var bookedSeats = bookedSeatsInt.Select(s => s.ToString()).ToList();

            return Ok(bookedSeats);
        }

        // POST: api/bookings
        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] BookingDto dto)
        {
            try
            {
                if (dto == null || dto.BusRouteId == 0 || dto.SeatNumbers == null || !dto.SeatNumbers.Any())
                {
                    return BadRequest(new { message = "Invalid booking request data received." });
                }

                // 1. Verify bus route exists
                var bus = await _context.BusRoutes.FindAsync(dto.BusRouteId);
                if (bus == null)
                {
                    return NotFound(new { message = "Bus route not found." });
                }

                // 2. Check if any seat is already booked in SQL Server (Concurrency guard)
                var alreadyBooked = await _context.BookedSeats
                    .Where(bs => bs.BusRouteId == dto.BusRouteId && dto.SeatNumbers.Contains(bs.SeatNumber))
                    .Select(bs => bs.SeatNumber)
                    .ToListAsync();

                if (alreadyBooked.Any())
                {
                    return BadRequest(new { message = $"Seats {string.Join(", ", alreadyBooked)} were just booked by another user. Please select different seats." });
                }

                // 3. Create Booking record with all required properties mapped correctly
                var booking = new Booking
                {
                    BusRouteId = dto.BusRouteId,
                    PassengerName = string.IsNullOrWhiteSpace(dto.PassengerName) ? "Guest Passenger" : dto.PassengerName,
                    Gender = dto.Gender ?? string.Empty,
                    BoardingPoint = dto.BoardingPoint ?? string.Empty,
                    DroppingPoint = dto.DroppingPoint ?? string.Empty,
                    PaymentMethod = dto.PaymentMethod ?? string.Empty,
                    SeatNumbers = string.Join(",", dto.SeatNumbers), // Stores seats as comma-separated text
                    TotalFare = dto.TotalFare,
                    BookingDate = DateTime.Now
                };

                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync();

                // 4. Save booked seats to lock them permanently
                foreach (var seatNum in dto.SeatNumbers)
                {
                    _context.BookedSeats.Add(new BookedSeat
                    {
                        BookingId = booking.Id,
                        SeatNumber = seatNum,
                        BusRouteId = dto.BusRouteId
                    });
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Payment successful and booking confirmed!", bookingId = booking.Id });
            }
            catch (Exception ex)
            {
                var detailedError = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return BadRequest(new { message = "Database Error: " + detailedError });
            }
        }
    }

    // Strongly-typed DTO for receiving all extended booking fields from the frontend
    public class BookingDto
    {
        public int BusRouteId { get; set; }
        public string PassengerName { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public string BoardingPoint { get; set; } = string.Empty;
        public string DroppingPoint { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public decimal TotalFare { get; set; }
        public List<int> SeatNumbers { get; set; } = new List<int>();
    }
}