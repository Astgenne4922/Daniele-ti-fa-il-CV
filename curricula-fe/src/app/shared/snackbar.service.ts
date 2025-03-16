import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root',
})
export class SnackbarService {
    private snackBar = inject(MatSnackBar);

    error(message: string) {
        this.snackBar.open(message, '', {
            duration: 3000,
            panelClass: ['error-snackbar'],
        });
    }

    success(message: string) {
        this.snackBar.open(message, '', {
            duration: 3000,
            panelClass: ['success-snackbar'],
        });
    }
}
