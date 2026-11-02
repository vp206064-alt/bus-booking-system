using System.Text.Json.Serialization;

namespace RedBus.Server.Models
{
    public class RouteStop
    {
        public int Id { get; set; }
        public int BusRouteId { get; set; }

        [JsonIgnore]
        public BusRoute? BusRoute { get; set; }

        public string StopName { get; set; } = string.Empty;
        public string StopTime { get; set; } = string.Empty; // e.g. "21:30"
        public string Type { get; set; } = "Boarding"; // "Boarding" or "Dropping"
    }
}