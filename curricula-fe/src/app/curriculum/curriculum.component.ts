import {
    animate,
    keyframes,
    style,
    transition,
    trigger,
} from '@angular/animations';
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
import { AdminDialogComponent } from './admin-dialog/admin-dialog.component';
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

export const shake = animate(
    '1000ms ease-in',
    keyframes([
        style({
            transform: 'translate3d(-1px, 0, 0)',
            offset: 0.1,
        }),
        style({
            transform: 'translate3d(2px, 0, 0)',
            offset: 0.2,
        }),
        style({
            transform: 'translate3d(-4px, 0, 0)',
            offset: 0.3,
        }),
        style({
            transform: 'translate3d(4px, 0, 0)',
            offset: 0.4,
        }),
        style({
            transform: 'translate3d(-4px, 0, 0)',
            offset: 0.5,
        }),
        style({
            transform: 'translate3d(4px, 0, 0)',
            offset: 0.6,
        }),
        style({
            transform: 'translate3d(-4px, 0, 0)',
            offset: 0.7,
        }),
        style({
            transform: 'translate3d(2px, 0, 0)',
            offset: 0.8,
        }),
        style({
            transform: 'translate3d(-1px, 0, 0)',
            offset: 0.9,
        }),
    ])
);

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
    animations: [
        trigger('error', [
            transition('good => submit', shake),
            transition('good => preview', shake),
        ]),
    ],
    templateUrl: './curriculum.component.html',
    styleUrl: './curriculum.component.css',
})
export class CurriculumComponent implements OnInit {
    private readonly NOME = 'Daniele';
    private readonly COGNOME = 'Candido';
    readonly isAdmin = false;

    private fb = inject(FormBuilder);
    private cvService = inject(CurriculumService);
    private destroyRef = inject(DestroyRef);
    private dialog = inject(MatDialog);

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
    isErrorSubmit = signal<'submit' | 'good'>('good');
    isErrorPreview = signal<'preview' | 'good'>('good');

    ngOnInit() {
        const subscription = this.cvService
            .getByNominativo(this.NOME, this.COGNOME)
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
                error: (err) => alert(err.error),
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

        if (this.form.invalid) {
            this.isErrorSubmit.set('submit');
            return;
        }

        const subscription = this.saveOrCreate().subscribe({
            error: (err) => console.log(err.error),
            next: (res) => alert(res),
        });
        this.destroyRef.onDestroy(() => subscription.unsubscribe());
    }

    openPreviewDialog(isAnon = false) {
        this.form.markAllAsTouched();

        if (this.form.invalid) {
            this.isErrorPreview.set('preview');
            return;
        }

        this.isLoading.set(true);

        const subscription = this.cvService
            .generatePDF(this.adaptFormValue(), isAnon)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                error: (err) => console.log(err.error),
                next: (res) => {
                    this.dialog.open(PdfDialogComponent, {
                        height: '90%',
                        width: '60%',
                        data: {
                            url: window.URL.createObjectURL(res),
                        },
                    });
                },
            });
        this.destroyRef.onDestroy(() => subscription.unsubscribe());
    }

    onDownload(isAnon = false) {
        if (!confirm('Salvare?')) return;

        this.form.markAllAsTouched();

        if (this.form.invalid) {
            return;
        }

        const subscription = this.saveOrCreate().subscribe({
            error: (err) => console.log(err.error),
            next: (_) => {
                const subscription = this.cvService
                    .generatePDF(this.adaptFormValue(), isAnon)
                    .subscribe({
                        error: (err) => console.log(err.error),
                        next: (res) => {
                            const url = window.URL.createObjectURL(res);
                            var link = document.createElement('a');
                            link.href = url;
                            link.download = `${this.NOME}_${this.COGNOME}${
                                isAnon ? '_Anon' : ''
                            }_cv.pdf`;
                            link.click();
                        },
                    });
                this.destroyRef.onDestroy(() => subscription.unsubscribe());
            },
        });
        this.destroyRef.onDestroy(() => subscription.unsubscribe());
    }

    openAdminDialog() {
        this.isLoading.set(true);

        const subscription = this.cvService
            .getAll()
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                error: (err) => console.log(err.error),
                next: (res) => {
                    this.dialog.open(AdminDialogComponent, {
                        maxHeight: '90%',
                        maxWidth: 'none',
                        data: res,
                    });
                },
            });
        this.destroyRef.onDestroy(() => subscription.unsubscribe());
    }

    private saveOrCreate() {
        const value = this.adaptFormValue();

        if (this.id) {
            return this.cvService.update(this.id, value);
        } else {
            return this.cvService.create(value);
        }
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
