using EZNotes.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure services
builder.Services.AddHttpClient<AiService>(); // Register HttpClient for AiService
builder.Services.AddControllers();           // Add support for controllers
builder.Services.AddEndpointsApiExplorer();  // Add support for Swagger endpoints
builder.Services.AddSwaggerGen();            // Add Swagger generator
builder.Services.AddSingleton<IConfiguration>(builder.Configuration);

// Add CORS configuration to allow frontend communication
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000") // Allow the frontend's origin
              .AllowAnyHeader()                     // Allow all headers
              .AllowAnyMethod();                    // Allow all HTTP methods
    });
});

var app = builder.Build();

// Configure middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "EZNotes API"));
}

app.UseHttpsRedirection(); // Ensure HTTPS redirection
app.UseRouting();

app.UseCors(); // Enable CORS middleware globally
app.UseAuthorization();

app.MapControllers(); // Map controllers

app.Run();
