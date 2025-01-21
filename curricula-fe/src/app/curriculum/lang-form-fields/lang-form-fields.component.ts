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
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Lingue } from '../curriculum.model';

@Component({
    selector: 'app-lang-form-fields',
    templateUrl: './lang-form-fields.component.html',
    styleUrls: ['./lang-form-fields.component.css'],
    imports: [
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatCardModule,
    ],
})
export class LangFormFieldsComponent implements OnInit, OnChanges {
    private fb = inject(FormBuilder);
    private rootFormGroup = inject(FormGroupDirective);

    formArrayName = input.required<string>();
    formArray!: FormArray;
    form!: FormGroup;

    preload = input.required<Lingue>();

    ngOnInit(): void {
        this.form = this.rootFormGroup.control;
        this.formArray = this.form.get(this.formArrayName()) as FormArray;
    }

    ngOnChanges() {
        if (this.preload()) {
            let newValue: {
                lingua: string;
                comprensione: string;
                parlato: string;
                scritto: string;
            }[] = [];
            for (const lang in this.preload()) {
                newValue.push({ lingua: lang, ...this.preload()![lang] });

                this.addFields();
            }

            this.formArray.patchValue(newValue);
        }
    }

    addFields() {
        this.formArray.push(
            this.fb.group({
                lingua: ['', [Validators.required]],
                comprensione: ['', [Validators.required]],
                parlato: ['', [Validators.required]],
                scritto: ['', [Validators.required]],
            })
        );
    }

    removeFields(index: number) {
        this.formArray.removeAt(index);
    }
}
