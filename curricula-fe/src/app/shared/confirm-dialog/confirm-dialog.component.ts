import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'e3-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    imports: [MatButtonModule],
    styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent {
    data = inject(MAT_DIALOG_DATA);

    dialog = inject(MatDialogRef<ConfirmDialogComponent>);

    onConfirm() {
        this.dialog.close(true);
    }

    closeDialog() {
        this.dialog.close(false);
    }
}
