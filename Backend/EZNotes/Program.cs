using EZNotes.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure services
builder.Services.AddHttpClient<AiService>();
builder.Services.AddControllers();  // Add support for controllers
builder.Services.AddSingleton<IConfiguration>(builder.Configuration);

var app = builder.Build();

// Configure middleware
app.UseRouting();
app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers(); // Map controllers
});

app.Run();
