namespace Curricula.Models
{
    public class WorkExperience {
        public required string Posizione { get; set; }
        public required string Azienda { get; set; }
        public required DateOnly DataInizio { get; set; }
        public DateOnly? DataFine { get; set; }
        public string? Dettagli { get; set; }
    }
}
