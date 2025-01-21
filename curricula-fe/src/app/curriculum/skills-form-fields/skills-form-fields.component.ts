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
import { Skill } from '../curriculum.model';

@Component({
    selector: 'app-skills-form-fields',
    templateUrl: './skills-form-fields.component.html',
    styleUrls: ['./skills-form-fields.component.css'],
    imports: [
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatCardModule,
    ],
})
export class SkillsFormFieldsComponent implements OnInit, OnChanges {
    private fb = inject(FormBuilder);
    private rootFormGroup = inject(FormGroupDirective);

    formArrayName = input.required<string>();
    formArray!: FormArray;
    form!: FormGroup;

    preload = input.required<Skill>();

    ngOnInit(): void {
        this.form = this.rootFormGroup.control;
        this.formArray = this.form.get(this.formArrayName()) as FormArray;
    }

    ngOnChanges() {
        if (this.preload()) {
            let newValue: {
                categoria: string;
                lista: string[];
            }[] = [];
            let idx = 0;
            for (const cat in this.preload()) {
                newValue.push({ categoria: cat, lista: this.preload()![cat] });

                this.addFields();

                this.preload()![cat].forEach((_) => this.addSubFields(idx));
                idx++;
            }

            this.formArray.patchValue(newValue);
        }
    }

    addFields() {
        this.formArray.push(
            this.fb.group({
                categoria: ['', [Validators.required]],
                lista: this.fb.array([]),
            })
        );
    }

    removeFields(index: number) {
        this.formArray.removeAt(index);
    }

    listaSkill(index: number) {
        return this.formArray.at(index).get('lista') as FormArray;
    }

    addSubFields(index: number) {
        this.listaSkill(index).push(this.fb.control('', [Validators.required]));
    }

    removeSubFields(index1: number, index2: number) {
        this.listaSkill(index1).removeAt(index2);
    }
}
