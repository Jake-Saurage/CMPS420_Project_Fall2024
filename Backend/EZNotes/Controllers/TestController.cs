using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using EZNotes.Services;
using Microsoft.Extensions.Logging;
using System.ComponentModel.DataAnnotations;
using System.Linq;

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
                string aiResponse = await _aiService.GenerateSummaryAsync(request.Text);

                if (string.IsNullOrWhiteSpace(aiResponse))
                {
                    _logger.LogWarning("AI service returned an empty response for input: {Text}", request.Text);
                    return StatusCode(500, new { error = "Failed to generate a summary. Please try again." });
                }

                string summary = aiResponse.Trim();

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
                string aiResponse = await _aiService.GenerateDefinitionAsync(string.Join(", ", request.Words));

                if (string.IsNullOrWhiteSpace(aiResponse))
                {
                    _logger.LogWarning("AI service returned an empty response for input: {Words}", string.Join(", ", request.Words));
                    return StatusCode(500, new { error = "Failed to define words. Please try again." });
                }

                string formattedResponse = string.Join("\n", aiResponse
                    .Split(new[] { '\n', '.', ';' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(line => line.Trim())
                    .Where(line => !string.IsNullOrWhiteSpace(line)));

                return Ok(new { definitions = formattedResponse });
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

        [HttpPost("process-keywords")]
        public async Task<IActionResult> ProcessKeywords([FromBody] KeywordRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Notes) || request.Keywords == null || request.Keywords.Length == 0)
            {
                return BadRequest(new { error = "Invalid input. Please provide both notes and keywords." });
            }

            try
            {
                string keywordDetails = await _aiService.FetchKeywordDetailsAsync(request.Notes, request.Keywords);

                if (string.IsNullOrWhiteSpace(keywordDetails))
                {
                    _logger.LogWarning("AI service returned an empty response for keywords: {Keywords}", string.Join(", ", request.Keywords));
                    return StatusCode(500, new { error = "Failed to process keywords. Please try again." });
                }

                return Ok(new { keywordDetails });
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
    }

    [ApiController]
    [Route("api/[controller]")]
    public class AiController : ControllerBase
    {
        private readonly AiService _aiService;

        public AiController(AiService aiService)
        {
            _aiService = aiService;
        }

        [HttpPost("long-summary")]
        public async Task<IActionResult> GenerateLongSummary([FromBody] SummarizationRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.InputText))
            {
                return BadRequest("Input text cannot be empty.");
            }

            try
            {
                var summary = await _aiService.GenerateLongSummaryAsync(request.InputText);
                return Ok(new { summary });
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(500, new { error = "Error calling the AI service.", details = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An unexpected error occurred.", details = ex.Message });
            }
        }
    }

    public class SummarizationRequest
    {
        public string InputText { get; set; }
    }

    public class DefineRequest
    {
        [Required(ErrorMessage = "The words field is required.")]
        public string[] Words { get; set; }
    }

    public class SummaryRequest
    {
        [Required(ErrorMessage = "The text field is required.")]
        public string Text { get; set; }
    }

    public class KeywordRequest
    {
        [Required(ErrorMessage = "The notes field is required.")]
        public string Notes { get; set; }

        [Required(ErrorMessage = "The keywords field is required.")]
        public string[] Keywords { get; set; }
    }
}
