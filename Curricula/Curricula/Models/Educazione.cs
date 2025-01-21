namespace Curricula.Models
{
    public class Educazione {
        public required string Titolo { get; set; }
        public required string Istituto { get; set; }
        public required DateOnly DataInizio { get; set; }
        public DateOnly? DataFine { get; set; }
        public string? Dettagli { get; set; }
    }
}
