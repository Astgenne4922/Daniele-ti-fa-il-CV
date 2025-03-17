namespace Curricula.Models
{
    public class Educazione {
        public required string Titolo { get; set; }
        public required string Istituto { get; set; }
        public required string DataInizio { get; set; }
        public string? DataFine { get; set; }
        public string? Dettagli { get; set; }
    }
}
