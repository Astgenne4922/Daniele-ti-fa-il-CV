import { Component, inject, input, OnChanges, OnInit } from '@angular/core';
import {
    FormArray,
    FormBuilder,
    FormGroup,
    FormGroupDirective,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import {
    MAT_FORM_FIELD_DEFAULT_OPTIONS,
    MatFormFieldModule,
} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Esperienze } from '../curriculum.model';

@Component({
    selector: 'app-work-form-fields',
    templateUrl: './work-form-fields.component.html',
    styleUrls: ['./work-form-fields.component.scss'],
    imports: [
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatDividerModule,
    ],
    providers: [
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: { floatLabel: 'always', appearance: 'outline' },
        },
    ],
})
export class WorkFormFieldsComponent implements OnInit, OnChanges {
    private fb = inject(FormBuilder);
    private rootFormGroup = inject(FormGroupDirective);

    formArrayName = input.required<string>();
    formArray!: FormArray;
    form!: FormGroup;

    preload = input.required<Esperienze>();

    ngOnInit(): void {
        this.form = this.rootFormGroup.control;
        this.formArray = this.form.get(this.formArrayName()) as FormArray;
    }

    ngOnChanges() {
        if (this.preload()) {
            this.preload()!.forEach((_) => {
                this.addFields();
            });
            this.formArray.patchValue(this.preload()!);
        }
    }

    addFields() {
        this.formArray.push(
            this.fb.group({
                posizione: ['', [Validators.required]],
                azienda: ['', [Validators.required]],
                dataInizio: ['', [Validators.required]],
                dataFine: [undefined],
                dettagli: [undefined],
            })
        );
    }

    removeFields(index: number) {
        this.formArray.removeAt(index);
    }
}
