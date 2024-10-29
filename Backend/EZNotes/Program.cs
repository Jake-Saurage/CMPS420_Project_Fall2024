using EZNotes.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure services
builder.Services.AddHttpClient<AiService>();
builder.Services.AddSingleton<IConfiguration>(builder.Configuration);
var app = builder.Build();

// Test the AiService method here
var aiService = app.Services.GetRequiredService<AiService>();
var response = await aiService.GenerateTextAsync();
Console.WriteLine(response);

app.Run();
