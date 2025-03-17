namespace Curricula.Models
{
    public class Curriculum {
        public required string Nome { get; set; }
        public required string Cognome { get; set; }
        public required string Indirizzo { get; set; }
        public required string Telefono { get; set; }
        public required string Email { get; set; }
        public string? Website { get; set; }
        public List<WorkExperience>? Esperienze { get; set; }
        public List<Educazione>? Studi { get; set; }
        /*
         {
            NomeLingua: {
                Comprensione: "B2",
                Parlato: "B2",
                Scritto: "B2"
            }
         }
         */
        public Dictionary<string, Lingua>? Lingue { get; set; }
        public Dictionary<string, List<string>>? Skill { get; set; }
    }
}
