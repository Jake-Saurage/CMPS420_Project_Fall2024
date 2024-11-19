using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace EZNotes.Services
{
    public class AiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _authToken;
        private const string MODEL_API_URL = "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct";

        public AiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _authToken = configuration["HuggingFace:ApiKey"];
            _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _authToken);
        }

        public async Task<string> GenerateSummaryAsync(string inputText)
        {
            var payload = new 
            { 
                inputs = $"Summarize this text concisely: {inputText}", // Explicit prompt for concise summary
                parameters = new 
                { 
                    max_new_tokens = 250, 
                    temperature = 0.7 // Add temperature for randomness control
                } 
            };
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(MODEL_API_URL, content);
            response.EnsureSuccessStatusCode();

            var jsonResponse = await response.Content.ReadAsStringAsync();
            using var document = JsonDocument.Parse(jsonResponse);

            // Extract and clean the AI response
            var aiResponse = document.RootElement[0].GetProperty("generated_text").GetString();
            return CleanResponse(aiResponse, inputText);
        }

        public async Task<string> GenerateDefinitionAsync(string inputText)
        {
            var payload = new 
            { 
                inputs = $"Define the term: {inputText}", // Explicit prompt for clear definitions
                parameters = new 
                { 
                    max_new_tokens = 350, 
                    temperature = 0.5 // Lower temperature for more precise definitions
                } 
            };
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(MODEL_API_URL, content);
            response.EnsureSuccessStatusCode();

            var jsonResponse = await response.Content.ReadAsStringAsync();
            using var document = JsonDocument.Parse(jsonResponse);

            // Extract and clean the AI response
            var aiResponse = document.RootElement[0].GetProperty("generated_text").GetString();
            return CleanResponse(aiResponse, inputText);
        }

        private string CleanResponse(string aiResponse, string userInput)
        {
            // Remove the user input or any redundant information from the AI response
            return aiResponse
                .Replace(userInput, string.Empty, StringComparison.OrdinalIgnoreCase) // Remove user input
                .Replace("Summarize this text concisely:", string.Empty, StringComparison.OrdinalIgnoreCase) // Remove prompt
                .Replace("Define the term:", string.Empty, StringComparison.OrdinalIgnoreCase) // Remove prompt
                .Trim();
        }
    }
}
