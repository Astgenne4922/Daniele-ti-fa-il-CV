using Curricula.Models;
using Curricula.Services;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace Curricula.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CurriculaController : ControllerBase
    {
        private readonly string json = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), ".curriculum_json_daniele", "curriculum.json");

        public CurriculaController() { }

        [HttpGet("get")]
        public IActionResult GetCurriculum([FromQuery] bool generatePDF = false, [FromQuery] bool isAnon = false)
        {
            try
            {
                string result = System.IO.File.ReadAllText(json);
                Curriculum cv = JsonConvert.DeserializeObject<Curriculum>(result);

                if (!generatePDF)
                    return Ok(cv);
                else
                    return GeneratePDF(cv, isAnon);
            }
            catch (Exception)
            {
                return BadRequest("Nessun curriculum in memoria");
            }
        }

        [HttpPost("generatePDF")]
        public IActionResult GeneratePDF([FromBody] Curriculum curriculum, bool isAnon = false)
        {
            try
            {
                Response.Headers.Append("Content-Disposition", $"inline; filename={curriculum.Nome}_{curriculum.Cognome}{(isAnon ? "_Anonimo" : "")}_cv.pdf");
                return File(PDFGenerator.JsonToPDF(curriculum, isAnon), "application/pdf");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return BadRequest(ex);
            }
        }

        [HttpPost("create")]
        public IActionResult CreateCurrculum([FromBody] Curriculum curriculum)
        {
            try
            {
                Directory.CreateDirectory(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), ".curriculum_json_daniele"));

                using (StreamWriter outputFile = System.IO.File.CreateText(json))
                {
                    outputFile.WriteLine(JsonConvert.SerializeObject(curriculum));
                }

                return Ok("Inserimento completato");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("update")]
        public IActionResult UpdateCurriculum([FromBody] Curriculum curriculum)
        {
            try
            {
                using (StreamWriter outputFile = new(json))
                {
                    outputFile.WriteLine(JsonConvert.SerializeObject(curriculum));
                }

                return Ok("Aggiornamento effettuato");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
