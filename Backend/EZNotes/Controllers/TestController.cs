using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using EZNotes.Services;

namespace EZNotes.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly AiService _aiService;

        public TestController(AiService aiService)
        {
            _aiService = aiService;
        }

        [HttpPost("summarize-text")]
        public async Task<IActionResult> SummarizeText([FromBody] SummaryRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Text))
            {
                return BadRequest("Invalid input. Please provide text to summarize.");
            }

            string response = await _aiService.GenerateSummaryAsync(request.Text);
            return Ok(response);
        }
    }

    public class SummaryRequest
    {
        public string Text { get; set; }
    }
}
