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
        private string _cachedResponse;  // Cache variable
        private const string MODEL_API_URL = "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct";

        public AiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _authToken = configuration["HuggingFace:ApiKey"];
            _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _authToken);
        }

        public async Task<string> GenerateSummaryAsync(string inputText)
        {
            // if (_cachedResponse != null) 
            // {
            //     return _cachedResponse; // Return cached response if it exists
            // }

            var payload = new { inputs = inputText, parameters = new { max_new_tokens = 260 } };

            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(MODEL_API_URL, content);
            response.EnsureSuccessStatusCode();

            var jsonResponse = await response.Content.ReadAsStringAsync();

            using var document = JsonDocument.Parse(jsonResponse);
            _cachedResponse = document.RootElement[0].GetProperty("generated_text").GetString(); // Cache response

            return _cachedResponse;
        }
    }
}