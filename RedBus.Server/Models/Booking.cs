using System;
using System.Collections.Generic;

namespace RedBus.Server.Models
{
    public class Booking
    {
        public int Id { get; set; }
        public int? UserId { get; set; } // Nullable user ID

        public int BusRouteId { get; set; }
        public BusRoute? BusRoute { get; set; }

        public string PassengerName { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty; // Added Gender rule support

        public string SeatNumbers { get; set; } = string.Empty; // Stores selected seats (e.g., "1, 2")

        // Added Admin-assigned / User-selected Points
        public string BoardingPoint { get; set; } = string.Empty;
        public string DroppingPoint { get; set; } = string.Empty;

        public string PaymentMethod { get; set; } = string.Empty; // GPay, PhonePe, Card, etc.
        public decimal? TotalFare { get; set; } // Nullable total fare

        public DateTime BookingDate { get; set; } = DateTime.Now;

        // Navigation property if using a separate BookedSeat table
        public ICollection<BookedSeat> BookedSeats { get; set; } = new List<BookedSeat>();
    }
}