import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Curriculum } from './curriculum.model';

const baseURL = 'http://localhost:5000/api/Curricula';

@Injectable({
    providedIn: 'root',
})
export class CurriculumService {
    private httpClient = inject(HttpClient);

    get() {
        return this.httpClient.get<Curriculum>(`${baseURL}`);
    }

    getPDF() {
        return this.httpClient.get(`${baseURL}?generatePDF=true`, {
            headers: new HttpHeaders({
                Accept: 'application/pdf',
                'Content-Type': 'application/pdf',
            }),
            responseType: 'blob',
        });
    }

    generatePDF(cv: Curriculum) {
        return this.httpClient.post(`${baseURL}/generatePDF`, cv, {
            responseType: 'blob',
        });
    }

    insert(cv: Curriculum) {
        return this.httpClient.post(`${baseURL}`, cv, {
            responseType: 'text',
        });
    }
}
