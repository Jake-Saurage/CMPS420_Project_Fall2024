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

        [HttpGet("generate-text")]
        public async Task<IActionResult> GenerateText()
        {
            string response = await _aiService.GenerateTextAsync();
            return Ok(response);
        }
    }
}
