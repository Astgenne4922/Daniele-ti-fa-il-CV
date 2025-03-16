import { formatDate } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, map } from 'rxjs';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { SnackbarService } from '../shared/snackbar.service';
import {
    Curriculum,
    Esperienze,
    Lingue,
    Skill,
    Studi,
} from './curriculum.model';
import { CurriculumService } from './curriculum.service';
import { LangFormFieldsComponent } from './lang-form-fields/lang-form-fields.component';
import { PdfDialogComponent } from './pdf-dialog/pdf-dialog.component';
import { SkillsFormFieldsComponent } from './skills-form-fields/skills-form-fields.component';
import { StudiesFormFieldsComponent } from './studies-form-fields/studies-form-fields.component';
import { WorkFormFieldsComponent } from './work-form-fields/work-form-fields.component';

@Component({
    selector: 'app-curriculum',
    imports: [
        ReactiveFormsModule,
        WorkFormFieldsComponent,
        StudiesFormFieldsComponent,
        LangFormFieldsComponent,
        SkillsFormFieldsComponent,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatExpansionModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        MatIconModule,
    ],
    templateUrl: './curriculum.component.html',
    styleUrl: './curriculum.component.scss',
})
export class CurriculumComponent implements OnInit {
    private readonly NOME = 'Daniele';
    private readonly COGNOME = 'Candido';

    private fb = inject(FormBuilder);
    private cvService = inject(CurriculumService);
    private destroyRef = inject(DestroyRef);
    private dialog = inject(MatDialog);
    private snackBar = inject(SnackbarService);

    form = this.fb.group({
        telefono: [
            '',
            [
                Validators.required,
                Validators.pattern(
                    /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/
                ),
            ],
        ],
        email: ['', [Validators.required, Validators.email]],
        indirizzo: ['', [Validators.required]],
        sito: '',
        esperienze: this.fb.array([]),
        studi: this.fb.array([]),
        lingue: this.fb.array([]),
        skill: this.fb.array([]),
    });

    esperienze = signal<Esperienze>(undefined);
    studi = signal<Studi>(undefined);
    lingue = signal<Lingue>(undefined);
    skill = signal<Skill>(undefined);

    id?: string;
    loadedCurriculum?: Curriculum;

    isLoading = signal(true);

    ngOnInit() {
        const subscription = this.cvService
            .getByNominativo()
            .pipe(
                map((val) => {
                    val.esperienze = val.esperienze?.map((e) => {
                        return {
                            ...e,
                            dataInizio: new Date(e.dataInizio),
                            dataFine: e.dataFine
                                ? new Date(e.dataFine)
                                : undefined,
                        };
                    });
                    return val;
                }),
                finalize(() => this.isLoading.set(false))
            )
            .subscribe({
                error: (_) => this.snackBar.error('Nessun Curriculum in memoria'),
                next: (res) => {
                    this.form.patchValue({
                        telefono: res.telefono,
                        email: res.email,
                        indirizzo: res.indirizzo,
                        sito: res.website,
                    });

                    this.esperienze.set(res.esperienze);
                    this.studi.set(res.studi);
                    this.lingue.set(res.lingue);
                    this.skill.set(res.skill);

                    this.id = res.id;
                    this.loadedCurriculum = res;
                },
            });
        this.destroyRef.onDestroy(() => subscription.unsubscribe());
    }

    onSubmit() {
        this.form.markAllAsTouched();

        const subscription = this.saveOrCreate().subscribe({
            error: (_) => this.snackBar.error('Impossibile salvare'),
            next: (_) => this.snackBar.success('Salvataggio Effettuato'),
        });
        this.destroyRef.onDestroy(() => subscription.unsubscribe());
    }

    openPreviewDialog() {
        this.form.markAllAsTouched();

        this.isLoading.set(true);

        const subscription = this.cvService
            .generatePDF(this.adaptFormValue())
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                error: (_) => this.snackBar.error("Impossibile visualizzare l'anteprima"),
                next: (res) => {
                    this.dialog.open(PdfDialogComponent, {
                        data: {
                            url: window.URL.createObjectURL(res),
                        },
                    });
                },
            });
        this.destroyRef.onDestroy(() => subscription.unsubscribe());
    }

    onDownload() {
        const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
            width: '200px',
            disableClose: true,
            data: {
                title: `Salvare?`,
            },
        });

        confirmDialog.afterClosed().subscribe((result) => {
            if (!result) {
                return;
            }
            this.form.markAllAsTouched();

            if (this.form.invalid) {
                return;
            }

            this.isLoading.set(true);

            const subscription = this.saveOrCreate()
                .pipe(
                    finalize(() => this.isLoading.set(false))
                )
                .subscribe({
                    error: (_) => this.snackBar.error('Impossibile salvare'),
                    next: (_) => {
                        const subscription = this.cvService
                            .generatePDF(this.adaptFormValue())
                            .pipe(finalize(() => this.isLoading.set(false)))
                            .subscribe({
                                error: (_) =>
                                    this.snackBar.error('Errore nella generazione del PDF'),
                                next: (res) => {
                                    const url = window.URL.createObjectURL(res);
                                    var link = document.createElement('a');
                                    link.href = url;
                                    link.download = `${this.NOME}_${this.COGNOME}$_cv.pdf`;
                                    link.click();
                                },
                            });
                        this.destroyRef.onDestroy(() =>
                            subscription.unsubscribe()
                        );
                    },
                });
            this.destroyRef.onDestroy(() => subscription.unsubscribe());
        });
    }

    private saveOrCreate() {
        const value = this.adaptFormValue();

        if (this.id)
            return this.cvService.update(value);
        else
            return this.cvService.create(value);
    }

    private adaptFormValue() {
        let value: Curriculum = {
            id: this.id,
            nome: this.NOME,
            cognome: this.COGNOME,
            indirizzo: this.form.value.indirizzo!,
            telefono: this.form.value.telefono!,
            email: this.form.value.email!,
        };

        if (this.form.value.sito) value.website = this.form.value.sito;

        if (this.form.value.esperienze) {
            value.esperienze = (this.form.value.esperienze as Esperienze)
                ?.sort(this.sortDates)
                .map(this.mapDates<NonNullable<Esperienze>[0]>);
        }

        if (this.form.value.studi) {
            value.studi = (this.form.value.studi as Studi)
                ?.sort(this.sortDates)
                .map(this.mapDates<NonNullable<Studi>[0]>);
        }

        if (this.form.value.lingue) {
            value.lingue = {};
            for (const lang of this.form.value.lingue as {
                lingua: string;
                comprensione: string;
                parlato: string;
                scritto: string;
            }[]) {
                value.lingue[lang.lingua] = {
                    comprensione: lang.comprensione,
                    parlato: lang.parlato,
                    scritto: lang.scritto,
                };
            }
        }

        if (this.form.value.skill) {
            value.skill = {};
            for (const skill of this.form.value.skill as {
                categoria: string;
                lista: string[];
            }[]) {
                value.skill[skill.categoria] = skill.lista;
            }
        }

        return value;
    }

    private sortDates(
        a: NonNullable<Studi | Esperienze>[0],
        b: NonNullable<Studi | Esperienze>[0]
    ) {
        const ai =
            typeof a.dataInizio === 'string'
                ? new Date(a.dataInizio)
                : (a.dataInizio as Date);
        ai.setHours(0, 0, 0, 0);

        const af =
            typeof a.dataFine === 'string'
                ? new Date(a.dataFine)
                : (a.dataFine as Date | undefined);
        af?.setHours(0, 0, 0, 0);

        const bi =
            typeof b.dataInizio === 'string'
                ? new Date(b.dataInizio)
                : (b.dataInizio as Date);
        bi.setHours(0, 0, 0, 0);

        const bf =
            typeof b.dataFine === 'string'
                ? new Date(b.dataFine)
                : (b.dataFine as Date | undefined);
        bf?.setHours(0, 0, 0, 0);

        if (bi.getTime() - ai.getTime() === 0) {
            if (!af && !bf) return 0;
            if (!af) return -1;
            if (!bf) return 1;

            return bf.getTime() - af.getTime();
        }

        return bi.getTime() - ai.getTime();
    }

    private mapDates<T>(e: NonNullable<Studi | Esperienze>[0]) {
        return {
            ...e,
            dataInizio: e.dataInizio
                ? formatDate(e.dataInizio, 'YYYY-MM-dd', 'it-IT')
                : '',
            dataFine: e.dataFine
                ? formatDate(e.dataFine, 'YYYY-MM-dd', 'it-IT')
                : undefined,
        } as T;
    }
}
