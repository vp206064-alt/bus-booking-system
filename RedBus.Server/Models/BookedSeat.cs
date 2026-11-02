namespace RedBus.Server
{
    public class BookedSeat
    {
        public int Id { get; set; }
        public int BookingId { get; set; }
        public int BusRouteId { get; set; }
        public int SeatNumber { get; set; } // Changed from string to int
    }
}