import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Curriculum } from './curriculum.model';

const baseURL = 'http://localhost:5000/api/Curricula';

@Injectable({
    providedIn: 'root',
})
export class CurriculumService {
    private httpClient = inject(HttpClient);

    getAll() {
        return this.httpClient.get<Curriculum[]>(`${baseURL}/get/all`);
    }

    getById() {
        return this.httpClient.get<Curriculum>(`${baseURL}/get`);
    }
    getByIdPDF() {
        return this.httpClient.get(
            `${baseURL}/get?generatePDF=true`,
            {
                headers: new HttpHeaders({
                    Accept: 'application/pdf',
                    'Content-Type': 'application/pdf',
                }),
                responseType: 'blob',
            }
        );
    }

    getByNominativo() {
        return this.httpClient.get<Curriculum>(`${baseURL}/get`);
    }
    getByNominativoPDF() {
        return this.httpClient.get(
            `${baseURL}/get?generatePDF=true`,
            {
                headers: new HttpHeaders({
                    Accept: 'application/pdf',
                    'Content-Type': 'application/pdf',
                }),
                responseType: 'blob',
            }
        );
    }

    generatePDF(cv: Curriculum) {
        return this.httpClient.post(
            `${baseURL}/generatePDF`,
            cv,
            { responseType: 'blob' }
        );
    }
    create(cv: Curriculum) {
        return this.httpClient.post(`${baseURL}/create`, cv, {
            responseType: 'text',
        });
    }

    update(newCv: Curriculum) {
        return this.httpClient.put(`${baseURL}/update`, newCv, {
            responseType: 'text',
        });
    }
}
