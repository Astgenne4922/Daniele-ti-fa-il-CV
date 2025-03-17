using Curricula.Models;
using iText.IO.Font.Constants;
using iText.IO.Image;
using iText.Kernel.Colors;
using iText.Kernel.Font;
using iText.Kernel.Geom;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas;
using iText.Kernel.Pdf.Canvas.Draw;
using iText.Kernel.Pdf.Event;
using iText.Layout;
using iText.Layout.Borders;
using iText.Layout.Element;
using iText.Layout.Properties;

namespace Curricula.Services
{
    public class PDFGenerator
    {
        //private readonly static Color COLOR_PRIMARY = new DeviceRgb(250 / 255f, 124 / 255f, 0);
        private readonly static Color COLOR_PRIMARY = new DeviceRgb(0.047f, 0.839f, 0.322f);
        //private readonly static Color COLOR_PRIMARY = new DeviceRgb(0.31f, 0.647f, 0.988f);
        //private readonly static Color COLOR_PRIMARY = new DeviceRgb(1f, 0.667f, 0.094f);

        public static byte[] JsonToPDF(Curriculum curriculum)
        {
            using (MemoryStream stream = new())
            {
                using (PdfWriter writer = new(stream))
                using (PdfDocument pdf = new(writer))
                using (Document document = new(pdf, PageSize.A4))
                {
                    PdfFont FONT_NORMAL = PdfFontFactory.CreateFont(StandardFonts.HELVETICA);
                    PdfFont FONT_BOLD = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);

                    document.SetFont(FONT_NORMAL);
                    document.SetMargins(0, 0, 0, 0);

                    pdf.AddEventHandler(PdfDocumentEvent.START_PAGE, new BackgroundEventHandler());

                    var mainTable = new Table(UnitValue.CreatePointArray([PageSize.A4.GetWidth() / 3 - 13, PageSize.A4.GetWidth() / 3 * 2 - 26]))
                        .SetMargins(0, 20, 0, 20)
                        .UseAllAvailableWidth()
                        .SetFixedLayout();

                    CreateHeader(mainTable, curriculum, FONT_BOLD);

                    mainTable.AddCell(Separator());

                    if (curriculum.Esperienze?.Count > 0)
                    {
                        CreateWorkSection(mainTable, curriculum.Esperienze, FONT_BOLD);

                        mainTable.AddCell(Separator());
                    }

                    if (curriculum.Studi?.Count > 0)
                    {
                        CreateEducationSection(mainTable, curriculum.Studi, FONT_BOLD);

                        mainTable.AddCell(Separator());
                    }

                    if (curriculum.Lingue?.Count > 0)
                    {
                        CreateLangSection(mainTable, curriculum.Lingue, FONT_BOLD);

                        mainTable.AddCell(Separator());
                    }

                    if (curriculum.Skill?.Count > 0)
                        CreateSkillSection(mainTable, curriculum.Skill, FONT_BOLD);

                    document.Add(mainTable);
                }

                return stream.ToArray();
            }

        }

        private static void CreateHeader(Table mainTable, Curriculum curriculum, PdfFont FONT_BOLD)
        {
            //var logo = new Image(ImageDataFactory.Create(System.IO.Path.GetDirectoryName(Process.GetCurrentProcess().MainModule.FileName) + @"\Resources\logo-e3.png"))
            //            .SetMaxWidth(UnitValue.CreatePointValue(125))
            //            .SetHorizontalAlignment(HorizontalAlignment.CENTER);

            var cellHeaderLeft = NewCell()
                //.Add(logo)
                .SetPadding(20)
                .SetVerticalAlignment(VerticalAlignment.MIDDLE);
            mainTable.AddCell(cellHeaderLeft);

            var divHeaderRight = new Div().SetKeepTogether(true).SetPaddingLeft(10);

            divHeaderRight.Add(new Paragraph().Add(new Text($"{curriculum.Nome} ").SetFontColor(COLOR_PRIMARY)).Add(curriculum.Cognome).SetFontSize(30).SetFont(FONT_BOLD));
            divHeaderRight.Add(new Paragraph().Add(new Text("Telefono: ").SetFont(FONT_BOLD)).Add(new Text($"{curriculum.Telefono}")));
            divHeaderRight.Add(new Paragraph().Add(new Text("Email: ").SetFont(FONT_BOLD)).Add(new Text($"{curriculum.Email}")));
            divHeaderRight.Add(new Paragraph().Add(new Text("Indirizzo: ").SetFont(FONT_BOLD)).Add(new Text($"{curriculum.Indirizzo}")));
            if (curriculum.Website != null)
                divHeaderRight.Add(new Paragraph().Add(new Text("Sito: ").SetFont(FONT_BOLD)).Add(new Text($"{curriculum.Website}")));

            var cellHeaderRight = NewCell()
                .Add(divHeaderRight)
                .SetVerticalAlignment(VerticalAlignment.MIDDLE);
            mainTable.AddCell(cellHeaderRight);
        }

        private static void CreateWorkSection(Table mainTable, List<WorkExperience> esperienze, PdfFont FONT_BOLD)
        {
            var cellWorkLeft = NewCell()
                        .Add(new Paragraph("ESPERIENZA PROFESSIONALE").SetFontSize(16).SetTextAlignment(TextAlignment.RIGHT))
                        .SetPaddingRight(10)
                        .SetVerticalAlignment(VerticalAlignment.TOP);
            mainTable.AddCell(cellWorkLeft);

            var divWorkRight = new Div();
            foreach (var exp in esperienze)
            {
                var tableWorkRight = new Table(UnitValue.CreatePointArray([120, 250])).SetKeepTogether(true).SetMarginTop(10).SetMarginBottom(10);
                tableWorkRight.AddCell(NewCell().Add(new Paragraph($"{exp.DataInizio} - {exp.DataFine?.ToString() ?? "Presente"}").SetFontSize(10).SetFontColor(ColorConstants.DARK_GRAY)));
                tableWorkRight.AddCell(NewCell().Add(new Paragraph($"{exp.Azienda}").SetFont(FONT_BOLD).SetFontSize(13)));
                tableWorkRight.AddCell(NewCell());
                tableWorkRight.AddCell(NewCell().Add(new Paragraph($"{exp.Posizione}").SetFontSize(12)));
                if (exp.Dettagli != null)
                {
                    tableWorkRight.AddCell(NewCell());
                    tableWorkRight.AddCell(NewCell().Add(new Paragraph($"{exp.Dettagli}").SetFontSize(10)));
                }

                divWorkRight.Add(tableWorkRight);
            }

            var cellWorkRight = NewCell().Add(divWorkRight);
            mainTable.AddCell(cellWorkRight);
        }

        private static void CreateEducationSection(Table mainTable, List<Educazione> studi, PdfFont FONT_BOLD)
        {
            var cellSchoolLeft = NewCell()
                        .Add(new Paragraph("FORMAZIONE").SetFontSize(16).SetTextAlignment(TextAlignment.RIGHT))
                        .SetPaddingRight(10)
                        .SetVerticalAlignment(VerticalAlignment.TOP);
            mainTable.AddCell(cellSchoolLeft);

            var divSchoolRight = new Div();
            foreach (var school in studi)
            {
                var tableSchoolRight = new Table(UnitValue.CreatePointArray([120, 250])).SetKeepTogether(true).SetMarginTop(10).SetMarginBottom(10);
                tableSchoolRight.AddCell(NewCell().Add(new Paragraph($"{school.DataInizio} - {school.DataFine?.ToString() ?? "Presente"}").SetFontSize(10).SetFontColor(ColorConstants.DARK_GRAY)));
                tableSchoolRight.AddCell(NewCell().Add(new Paragraph($"{school.Istituto}").SetFont(FONT_BOLD).SetFontSize(13)));
                tableSchoolRight.AddCell(NewCell());
                tableSchoolRight.AddCell(NewCell().Add(new Paragraph($"{school.Titolo}").SetFontSize(12)));
                if (school.Dettagli != null)
                {
                    tableSchoolRight.AddCell(NewCell());
                    tableSchoolRight.AddCell(NewCell().Add(new Paragraph($"{school.Dettagli}").SetFontSize(10)));
                }

                divSchoolRight.Add(tableSchoolRight);
            }

            var cellSchoolRight = NewCell().Add(divSchoolRight);
            mainTable.AddCell(cellSchoolRight);
        }

        private static void CreateLangSection(Table mainTable, Dictionary<string, Lingua> lingue, PdfFont FONT_BOLD)
        {
            var cellLangLeft = NewCell()
                        .Add(new Paragraph("LINGUE").SetFontSize(16).SetTextAlignment(TextAlignment.RIGHT))
                        .SetPaddingRight(10)
                        .SetVerticalAlignment(VerticalAlignment.TOP);
            mainTable.AddCell(cellLangLeft);

            var tableLangRightSuper = new Table(2).SetMarginLeft(10);
            foreach (var (lingua, proficency) in lingue)
            {
                var tableLangRight = new Table(UnitValue.CreatePointArray([200])).SetKeepTogether(true).SetMargins(10, 5, 10, 5);
                tableLangRight.AddCell(new Cell().SetBorder(Border.NO_BORDER).Add(new Paragraph(lingua).SetFont(FONT_BOLD)));

                var list = new List().SetListSymbol(" • ");
                list.Add($"Comprensione: {proficency.Comprensione}");
                list.Add($"Parlato: {proficency.Parlato}");
                list.Add($"Scritto: {proficency.Scritto}");
                tableLangRight.AddCell(new Cell().SetBorder(Border.NO_BORDER).Add(list));

                tableLangRightSuper.AddCell(new Cell().Add(tableLangRight).SetBorder(null));
            }

            var cellLangRight = NewCell().Add(tableLangRightSuper);
            mainTable.AddCell(cellLangRight);
        }

        private static void CreateSkillSection(Table mainTable, Dictionary<string, List<string>> skills, PdfFont FONT_BOLD)
        {
            var cellSkillLeft = NewCell()
                        .Add(new Paragraph("COMPETENZE").SetFontSize(16).SetTextAlignment(TextAlignment.RIGHT))
                        .SetPaddingRight(10)
                        .SetVerticalAlignment(VerticalAlignment.TOP);
            mainTable.AddCell(cellSkillLeft);

            var tableSkillRightSuper = new Table(2).SetMarginLeft(10);
            foreach (var (categoria, skill) in skills)
            {
                var tableSkillRight = new Table(UnitValue.CreatePointArray([200])).SetKeepTogether(true).SetMargins(10, 5, 10, 5);
                tableSkillRight.AddCell(new Cell().SetBorder(Border.NO_BORDER).Add(new Paragraph(categoria).SetFont(FONT_BOLD)));

                var list = new List().SetListSymbol(" • ");
                foreach (var s in skill)
                    list.Add(s);

                tableSkillRight.AddCell(new Cell().SetBorder(Border.NO_BORDER).Add(list));

                tableSkillRightSuper.AddCell(new Cell().Add(tableSkillRight).SetBorder(null));
            }

            var cellLangRight = NewCell().Add(tableSkillRightSuper);
            mainTable.AddCell(cellLangRight);
        }

        private static Cell NewCell() => new Cell().SetBorder(Border.NO_BORDER);

        private static Cell Separator() => new Cell(1, 2).SetBorder(Border.NO_BORDER).Add(new LineSeparator(new SolidLine(1.5f)));

        private class BackgroundEventHandler : AbstractPdfDocumentEventHandler
        {
            protected override void OnAcceptedEvent(AbstractPdfDocumentEvent @event)
            {
                var docEvent = (PdfDocumentEvent)@event;
                var pdfDoc = docEvent.GetDocument();
                var page = docEvent.GetPage();
                var canvas = new PdfCanvas(page.NewContentStreamBefore(), page.GetResources(), pdfDoc);

                Rectangle area = page.GetPageSize().DecreaseWidth(page.GetPageSize().GetWidth() / 3 * 2 - 6);
                canvas.SaveState().Rectangle(area).SetFillColor(COLOR_PRIMARY).Fill().RestoreState();
            }
        }
    }
}
