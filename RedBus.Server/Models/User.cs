namespace RedBus.Server
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty; // In production, hash this!
        public string Role { get; set; } = "User"; // "Admin" or "User"
    }
}