using Microsoft.EntityFrameworkCore;
using RedBus.Server.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Add CORS policy to allow requests from React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Add services to the container.
builder.Services.AddControllers();

// Register SQL Server Database Context with EnableRetryOnFailure for transient resiliency
builder.Services.AddDbContext<RedBusDbContext>(options =>
    options.UseSqlServer(
        "Server=localhost;Database=RedBusDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true",
        sqlServerOptionsAction: sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        }
    ));

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseDefaultFiles();
app.MapStaticAssets();

// 2. Enable CORS Middleware (Must be before UseHttpsRedirection & UseAuthorization)
app.UseCors("AllowReactApp");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("/index.html");

app.Run();