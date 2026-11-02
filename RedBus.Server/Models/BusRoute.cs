using System;
using System.Collections.Generic;

namespace RedBus.Server.Models
{
    public class BusRoute
    {
        public int Id { get; set; }
        public string BusName { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public string Destination { get; set; } = string.Empty;
        public decimal Fare { get; set; }
        public DateTime DepartureTime { get; set; }
        public int TotalSeats { get; set; } = 20;

        // Navigation property for custom Boarding and Dropping points
        public List<RouteStop> Stops { get; set; } = new List<RouteStop>();
    }
}