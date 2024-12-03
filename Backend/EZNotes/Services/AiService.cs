using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace EZNotes.Services
{
    public class AiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _authTokenDefault;
        private readonly string _authTokenModel2;
        private readonly ILogger<AiService> _logger;

        private const string MODEL_API_URL = "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct";
        private const string T5_SUMMARY_API_URL = "https://api-inference.huggingface.co/models/pszemraj/long-t5-tglobal-base-16384-book-summary";

        public AiService(HttpClient httpClient, IConfiguration configuration, ILogger<AiService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;

            _authTokenDefault = configuration["HuggingFace:ApiKey"];
            _authTokenModel2 = configuration["HuggingFace:ApiKey2"];

            if (string.IsNullOrWhiteSpace(_authTokenDefault) || string.IsNullOrWhiteSpace(_authTokenModel2))
            {
                throw new ArgumentNullException("HuggingFace API keys are missing in configuration.");
            }
        }

        private void SetAuthorizationHeader(bool useModel2)
        {
            var token = useModel2 ? _authTokenModel2 : _authTokenDefault;
            _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        }

        private StringContent CreateHttpContent(object payload)
        {
            var jsonPayload = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
            return content;
        }

        public async Task<string> GenerateSummaryAsync(string inputText)
        {
            SetAuthorizationHeader(useModel2: false);

            var payload = new
            {
                inputs = $"Summarize this text concisely: {inputText}"
            };

            var content = CreateHttpContent(payload);

            var response = await _httpClient.PostAsync(MODEL_API_URL, content);

            if (!response.IsSuccessStatusCode)
            {
                var errorResponse = await response.Content.ReadAsStringAsync();
                _logger.LogError("Hugging Face API returned an error: {Error}", errorResponse);
                throw new Exception($"Hugging Face API error: {errorResponse}");
            }

            var jsonResponse = await response.Content.ReadAsStringAsync();
            _logger.LogInformation("Raw response from Hugging Face: {Response}", jsonResponse);

            var aiResponse = JsonDocument.Parse(jsonResponse).RootElement[0].GetProperty("generated_text").GetString();
            if (string.IsNullOrWhiteSpace(aiResponse))
            {
                _logger.LogWarning("Hugging Face API returned an empty response.");
                throw new Exception("The AI service returned an empty response.");
            }

            return aiResponse.Trim();
        }

        public async Task<string> GenerateDefinitionAsync(string inputText)
        {
            SetAuthorizationHeader(useModel2: false);

            var payload = new
            {
                inputs = $"Define the following terms: {inputText}. Provide only definitions without any extra information.",
                parameters = new { temperature = 0.2 }
            };

            var content = CreateHttpContent(payload);

            var response = await _httpClient.PostAsync(MODEL_API_URL, content);

            if (!response.IsSuccessStatusCode)
            {
                var errorResponse = await response.Content.ReadAsStringAsync();
                _logger.LogError("Hugging Face API returned an error: {Error}", errorResponse);
                throw new Exception($"Hugging Face API error: {errorResponse}");
            }

            var jsonResponse = await response.Content.ReadAsStringAsync();
            _logger.LogInformation("Raw response from Hugging Face: {Response}", jsonResponse);

            var aiResponse = JsonDocument.Parse(jsonResponse).RootElement[0].GetProperty("generated_text").GetString();
            if (string.IsNullOrWhiteSpace(aiResponse))
            {
                _logger.LogWarning("Hugging Face API returned an empty response.");
                throw new Exception("The AI service returned an empty response.");
            }

            // Remove the prompt artifacts from the response
            var cleanedResponse = RemovePromptArtifacts(aiResponse, inputText);
            _logger.LogInformation("Cleaned AI Response: {Response}", cleanedResponse);

            return cleanedResponse.Trim();
        }

        public async Task<string> GenerateLongSummaryAsync(string inputText)
        {
            SetAuthorizationHeader(useModel2: false);

            const string BART_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";

            var payload = new
            {
                inputs = inputText,
                parameters = new
                {
                    max_length = 750, // Adjust maximum length for the summary
                    min_length = 150, // Adjust minimum length for the summary
                    do_sample = false // Ensure deterministic output
                }
            };

            var content = CreateHttpContent(payload);

            int maxRetries = 3; // Maximum number of retries for loading issues
            int retryCount = 0;

            while (retryCount < maxRetries)
            {
                var response = await _httpClient.PostAsync(BART_API_URL, content);

                var jsonResponse = await response.Content.ReadAsStringAsync();
                _logger.LogInformation("Raw response from Hugging Face: {Response}", jsonResponse);

                if (response.IsSuccessStatusCode)
                {
                    try
                    {
                        using var document = JsonDocument.Parse(jsonResponse);

                        if (document.RootElement.ValueKind == JsonValueKind.Array && document.RootElement.GetArrayLength() > 0)
                        {
                            var firstElement = document.RootElement[0];
                            if (firstElement.TryGetProperty("summary_text", out var summaryText))
                            {
                                var aiResponse = summaryText.GetString();
                                if (!string.IsNullOrWhiteSpace(aiResponse))
                                {
                                    return aiResponse.Trim();
                                }
                                else
                                {
                                    throw new Exception("The 'summary_text' key is empty.");
                                }
                            }
                            else
                            {
                                throw new Exception("The 'summary_text' key is missing in the response.");
                            }
                        }
                        else
                        {
                            throw new Exception("Unexpected API response format.");
                        }
                    }
                    catch (JsonException ex)
                    {
                        _logger.LogError(ex, "Error parsing Hugging Face response.");
                        throw new Exception("Failed to parse AI service response.", ex);
                    }
                }
                else
                {
                    if (jsonResponse.Contains("currently loading"))
                    {
                        try
                        {
                            using var document = JsonDocument.Parse(jsonResponse);
                            if (document.RootElement.TryGetProperty("estimated_time", out var estimatedTime))
                            {
                                double waitTime = estimatedTime.GetDouble();
                                _logger.LogWarning("Model is loading. Retrying after {WaitTime} seconds...", waitTime);
                                await Task.Delay(TimeSpan.FromSeconds(waitTime));
                                retryCount++;
                                continue;
                            }
                        }
                        catch (JsonException ex)
                        {
                            _logger.LogError(ex, "Error parsing loading response from Hugging Face.");
                            throw new Exception("Failed to parse loading response from Hugging Face.", ex);
                        }
                    }

                    var errorResponse = jsonResponse;
                    _logger.LogError("Hugging Face API returned an error: {ErrorResponse}", errorResponse);
                    throw new Exception($"Hugging Face API error: {errorResponse}");
                }
            }

            throw new Exception("Failed to get a valid response from Hugging Face after multiple retries.");
        }

        public async Task<string> FetchKeywordDetailsAsync(string notes, string[] keywords)
        {
            SetAuthorizationHeader(useModel2: false);

            // Prompt updated to reduce the likelihood of including the prompt in the response
            var keywordDetailsPrompt = $"You are given the following notes: \"{notes}\". Explain the keywords: {string.Join(", ", keywords)}. Only provide keyword explanations in list form, without including the prompt text or additional commentary.";

            var payload = new
            {
                inputs = keywordDetailsPrompt
            };

            var content = CreateHttpContent(payload);

            var response = await _httpClient.PostAsync(MODEL_API_URL, content);

            if (!response.IsSuccessStatusCode)
            {
                var errorResponse = await response.Content.ReadAsStringAsync();
                _logger.LogError("Hugging Face API returned an error: {Error}", errorResponse);
                throw new Exception($"Hugging Face API error: {errorResponse}");
            }

            var jsonResponse = await response.Content.ReadAsStringAsync();
            _logger.LogInformation("Raw response from Hugging Face: {Response}", jsonResponse);

            try
            {
                // Extract the generated response
                var aiResponse = JsonDocument.Parse(jsonResponse).RootElement[0].GetProperty("generated_text").GetString();

                if (string.IsNullOrWhiteSpace(aiResponse))
                {
                    _logger.LogWarning("Hugging Face API returned an empty response.");
                    throw new Exception("The AI service returned an empty response.");
                }

                // Safeguard: Post-process the response to remove the prompt if included
                var cleanedResponse = RemovePromptArtifacts(aiResponse, keywordDetailsPrompt);
                _logger.LogInformation("Cleaned AI Response: {Response}", cleanedResponse);

                return cleanedResponse.Trim();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error parsing the response from Hugging Face API.");
                throw new Exception("Failed to parse the response from the AI service.", ex);
            }
        }

        // Helper method to remove artifacts of the prompt in the response
        private string RemovePromptArtifacts(string response, string prompt)
        {
            // Remove the exact prompt if it appears in the response
            if (response.Contains(prompt))
            {
                response = response.Replace(prompt, string.Empty).Trim();
            }

            // Remove any leading or embedded artifacts
            var artifacts = new[]
            {
                "You are given the following notes:",
                "Explain the keywords:",
                "Only provide keyword explanations in list form, without including the prompt text or additional commentary:",
                "Define the following terms:",
                "Provide only definitions without any extra information",
                "Summarize this text concisely:",
                "I'll ignore the additional gibberish at the end and provide the concise summary:"
            };

            foreach (var artifact in artifacts)
            {
                response = response.Replace(artifact, string.Empty).Trim();
            }

            return response;
        }
    }
}
