using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using EZNotes.Services;
using Microsoft.Extensions.Logging;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace EZNotes.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly AiService _aiService;
        private readonly ILogger<TestController> _logger;

        public TestController(AiService aiService, ILogger<TestController> logger)
        {
            _aiService = aiService;
            _logger = logger;
        }

       [HttpPost("summarize-text")]
public async Task<IActionResult> SummarizeText([FromBody] SummaryRequest request)
{
    if (request == null || string.IsNullOrWhiteSpace(request.Text))
    {
        return BadRequest(new { error = "Invalid input. Please provide text to summarize." });
    }

    try
    {
        // Create a prompt explicitly asking for a summary without referencing the input
        string prompt = $"Summarize the following text in a concise and clear manner without including or repeating the original text:\n\n{request.Text}";

        // Call the AI service to generate the summary
        string aiResponse = await _aiService.GenerateSummaryAsync(prompt);

        if (string.IsNullOrWhiteSpace(aiResponse))
        {
            _logger.LogWarning("AI service returned an empty response for input: {Text}", request.Text);
            return StatusCode(500, new { error = "Failed to generate a summary. Please try again." });
        }

        // Ensure the AI response only contains the summary
        string summary = aiResponse
            .Trim(); // Clean up any leading or trailing whitespace

        return Ok(new { summary });
    }
    catch (HttpRequestException ex)
    {
        _logger.LogError(ex, "Error occurred while calling the AI service.");
        return StatusCode(503, new { error = "The AI service is currently unavailable. Please try again later." });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "An unexpected error occurred.");
        return StatusCode(500, new { error = "An unexpected error occurred. Please try again." });
    }
}


[HttpPost("define-words")]
public async Task<IActionResult> DefineWords([FromBody] DefineRequest request)
{
    if (request == null || request.Words == null || request.Words.Length == 0)
    {
        return BadRequest(new { error = "Invalid input. Please provide words to define." });
    }

    try
    {
        // Create a concise and simple prompt
        string prompt = $"Provide simple definitions for the following terms: {string.Join(", ", request.Words)}";

        // Call the AI service to generate definitions
        string aiResponse = await _aiService.GenerateDefinitionAsync(prompt);

        if (string.IsNullOrWhiteSpace(aiResponse))
        {
            _logger.LogWarning("AI service returned an empty response for input: {Words}", string.Join(", ", request.Words));
            return StatusCode(500, new { error = "Failed to define words. Please try again." });
        }

        // Remove the prompt and user input from the AI's response
        string[] cleanedDefinitions = aiResponse
            .Split('\n')
            .Select(line => line.Trim())
            .Where(line => !string.IsNullOrWhiteSpace(line))
            .ToArray();

        return Ok(new { definitions = cleanedDefinitions });
    }
    catch (HttpRequestException ex)
    {
        _logger.LogError(ex, "Error occurred while calling the AI service.");
        return StatusCode(503, new { error = "The AI service is currently unavailable. Please try again later." });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "An unexpected error occurred.");
        return StatusCode(500, new { error = "An unexpected error occurred. Please try again." });
    }
}


public class DefineRequest
{
    [Required(ErrorMessage = "The words field is required.")]
    public string[] Words { get; set; }
}


    }

    public class SummaryRequest
    {
        [Required(ErrorMessage = "The text field is required.")]
        public string Text { get; set; }
    }
}
