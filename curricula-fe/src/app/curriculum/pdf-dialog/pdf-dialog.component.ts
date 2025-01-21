import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
    selector: 'app-pdf-dialog',
    imports: [PdfViewerModule, MatDialogModule, MatButtonModule],
    templateUrl: './pdf-dialog.component.html',
    styleUrl: './pdf-dialog.component.css',
})
export class PdfDialogComponent {
    data = inject<{ url: string }>(MAT_DIALOG_DATA);
}
