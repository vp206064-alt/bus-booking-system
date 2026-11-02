using Microsoft.EntityFrameworkCore;
using RedBus.Server.Models;

namespace RedBus.Server.Data
{
    public class RedBusDbContext : DbContext
    {
        // 1. Parameterless constructor for design-time tools (migrations)
        public RedBusDbContext() { }

        // 2. Constructor for runtime Dependency Injection
        public RedBusDbContext(DbContextOptions<RedBusDbContext> options) : base(options) { }

        public DbSet<BusRoute> BusRoutes { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<BookedSeat> BookedSeats { get; set; }
        public DbSet<RouteStop> RouteStops { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer(
                    "Server=localhost;Database=RedBusDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true",
                    sqlOptions => sqlOptions.EnableRetryOnFailure()
                );
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // This ensures a specific seat on a specific bus can only ever be booked ONCE
            modelBuilder.Entity<BookedSeat>()
                .HasIndex(s => new { s.BusRouteId, s.SeatNumber })
                .IsUnique();

            // Configure relationship for BusRoute and RouteStops
            modelBuilder.Entity<RouteStop>()
                .HasOne(rs => rs.BusRoute)
                .WithMany(br => br.Stops)
                .HasForeignKey(rs => rs.BusRouteId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}