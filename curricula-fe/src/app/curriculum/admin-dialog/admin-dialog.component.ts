import { Component, DestroyRef, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogModule,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, forkJoin, map } from 'rxjs';
import { CurriculumService } from '../curriculum.service';
import { PdfDialogComponent } from '../pdf-dialog/pdf-dialog.component';
import JSZip from 'jszip';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-admin-dialog',
    imports: [
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatDividerModule,
        DatePipe,
    ],
    templateUrl: './admin-dialog.component.html',
    styleUrl: './admin-dialog.component.css',
})
export class AdminDialogComponent {
    private cvService = inject(CurriculumService);
    private dialog = inject(MatDialog);
    private destroyRef = inject(DestroyRef);

    data = inject<
        {
            id: string;
            nome: string;
            cognome: string;
            dataModifica: string;
        }[]
    >(MAT_DIALOG_DATA).map((e) => ({
        ...e,
        dataModifica: new Date(e.dataModifica),
        checked: false,
    }));
    isAllChecked = signal(false);

    isLoading = signal(false);

    openPreviewDialog(idx: number, isAnon = false) {
        this.isLoading.set(true);

        const subscription = this.cvService
            .getByIdPDF(this.data[idx].id, isAnon)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                error: (err) => console.log(err.error),
                next: (res) => {
                    this.dialog.open(PdfDialogComponent, {
                        height: '90%',
                        width: '60%',
                        data: {
                            url: URL.createObjectURL(res),
                        },
                    });
                },
            });
        this.destroyRef.onDestroy(() => subscription.unsubscribe());
    }

    onDownload(idx: number, isAnon = false) {
        this.isLoading.set(true);

        const subscription = this.cvService
            .getByIdPDF(this.data[idx].id, isAnon)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                error: (err) => console.log(err.error),
                next: (res) => {
                    const url = window.URL.createObjectURL(res);
                    var link = document.createElement('a');
                    link.href = url;
                    link.download = `${this.data[idx].nome}_${
                        this.data[idx].cognome
                    }${isAnon ? '_Anon' : ''}_cv.pdf`;
                    link.click();
                },
            });
        this.destroyRef.onDestroy(() => subscription.unsubscribe());
    }

    onDownloadAll(isAnon = false) {
        const checked = this.data.filter((e) => e.checked);

        if (checked.length === 0) return;

        this.isLoading.set(true);

        const subscription = forkJoin(
            checked.map((e) =>
                this.cvService.getByIdPDF(e.id, isAnon).pipe(
                    map((res) => {
                        return {
                            filename: `${e.nome}_${e.cognome}${
                                isAnon ? '_Anon' : ''
                            }_cv.pdf`,
                            data: res,
                        };
                    }),
                    finalize(() => this.isLoading.set(false))
                )
            )
        ).subscribe({
            error: (err) => console.log(err.error),
            next: (res) => {
                const zip = new JSZip();
                res.forEach((e) => zip.file(e.filename, e.data));
                zip.generateAsync({ type: 'base64' }).then((base64) => {
                    var link = document.createElement('a');
                    link.href = 'data:application/zip;base64,' + base64;
                    link.download = `curricula_e3${isAnon ? '_Anon' : ''}.zip`;
                    link.click();
                });
            },
        });
        this.destroyRef.onDestroy(() => subscription.unsubscribe());
    }

    partiallyComplete() {
        return (
            this.data.some((e) => e.checked) &&
            !this.data.every((e) => e.checked)
        );
    }

    update(completed: boolean, index?: number) {
        if (index === undefined) {
            this.isAllChecked.set(completed);
            this.data = this.data?.map((e) => ({ ...e, checked: completed }));
        } else {
            this.data[index].checked = completed;
            this.isAllChecked.set(this.data?.every((t) => t.checked) ?? true);
        }
    }
}
