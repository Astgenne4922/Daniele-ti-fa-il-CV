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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Studi } from '../curriculum.model';

@Component({
    selector: 'app-studies-form-fields',
    templateUrl: './studies-form-fields.component.html',
    styleUrls: ['./studies-form-fields.component.scss'],
    imports: [
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatDatepickerModule,
        MatDividerModule,
    ],
})
export class StudiesFormFieldsComponent implements OnInit, OnChanges {
    private fb = inject(FormBuilder);
    private rootFormGroup = inject(FormGroupDirective);

    formArrayName = input.required<string>();
    formArray!: FormArray;
    form!: FormGroup;

    preload = input.required<Studi>();

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
                titolo: ['', [Validators.required]],
                istituto: ['', [Validators.required]],
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
