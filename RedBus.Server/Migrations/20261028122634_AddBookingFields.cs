using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RedBus.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BoardingPoint",
                table: "Bookings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DroppingPoint",
                table: "Bookings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Gender",
                table: "Bookings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethod",
                table: "Bookings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SeatNumbers",
                table: "Bookings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_BusRouteId",
                table: "Bookings",
                column: "BusRouteId");

            migrationBuilder.CreateIndex(
                name: "IX_BookedSeats_BookingId",
                table: "BookedSeats",
                column: "BookingId");

            migrationBuilder.AddForeignKey(
                name: "FK_BookedSeats_Bookings_BookingId",
                table: "BookedSeats",
                column: "BookingId",
                principalTable: "Bookings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_BusRoutes_BusRouteId",
                table: "Bookings",
                column: "BusRouteId",
                principalTable: "BusRoutes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BookedSeats_Bookings_BookingId",
                table: "BookedSeats");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_BusRoutes_BusRouteId",
                table: "Bookings");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_BusRouteId",
                table: "Bookings");

            migrationBuilder.DropIndex(
                name: "IX_BookedSeats_BookingId",
                table: "BookedSeats");

            migrationBuilder.DropColumn(
                name: "BoardingPoint",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "DroppingPoint",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "Gender",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "SeatNumbers",
                table: "Bookings");
        }
    }
}
