using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace EZNotes.Services
{
    public class AiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private const string API_URL = "https://api-inference.huggingface.co/models/openai-community/gpt2";

        public AiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["HuggingFace:ApiKey"]; // API Key fetched from configuration
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        }

        public async Task<string> QueryAsync(string inputText)
        {
            try
            {
                var payload = new { inputs = inputText };
                var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(API_URL, content);

                // Check for HTTP success status
                response.EnsureSuccessStatusCode();

                var jsonResponse = await response.Content.ReadAsStringAsync();
                return jsonResponse;
            }
            catch (HttpRequestException httpEx)
            {
                // Log the error or handle it as needed
                Console.WriteLine($"Request error: {httpEx.Message}");
                return $"Error: Unable to process the request. {httpEx.Message}";
            }
            catch (Exception ex)
            {
                // General error handling
                Console.WriteLine($"An error occurred: {ex.Message}");
                return $"Error: Something went wrong. {ex.Message}";
            }
        }
    }
}
