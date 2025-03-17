namespace Curricula.Models
{
    public class WorkExperience {
        public required string Posizione { get; set; }
        public required string Azienda { get; set; }
        public required string DataInizio { get; set; }
        public string? DataFine { get; set; }
        public string? Dettagli { get; set; }
    }
}
