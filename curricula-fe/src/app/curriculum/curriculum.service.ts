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

    getById(id: string) {
        return this.httpClient.get<Curriculum>(`${baseURL}/get`);
    }
    getByIdPDF(id: string, isAnon = false) {
        return this.httpClient.get(
            `${baseURL}/get?generatePDF=true&isAnon=${isAnon}`,
            {
                headers: new HttpHeaders({
                    Accept: 'application/pdf',
                    'Content-Type': 'application/pdf',
                }),
                responseType: 'blob',
            }
        );
    }

    getByNominativo(nome: string, cognome: string) {
        return this.httpClient.get<Curriculum>(`${baseURL}/get`);
    }
    getByNominativoPDF(nome: string, cognome: string, isAnon = false) {
        return this.httpClient.get(
            `${baseURL}/get?generatePDF=true&isAnon=${isAnon}`,
            {
                headers: new HttpHeaders({
                    Accept: 'application/pdf',
                    'Content-Type': 'application/pdf',
                }),
                responseType: 'blob',
            }
        );
    }

    generatePDF(cv: Curriculum, isAnon = false) {
        return this.httpClient.post(
            `${baseURL}/generatePDF?isAnon=${isAnon}`,
            cv,
            { responseType: 'blob' }
        );
    }
    create(cv: Curriculum) {
        return this.httpClient.post(`${baseURL}/create`, cv, {
            responseType: 'text',
        });
    }

    update(id: string, newCv: Curriculum) {
        return this.httpClient.put(`${baseURL}/update`, newCv, {
            responseType: 'text',
        });
    }
}
