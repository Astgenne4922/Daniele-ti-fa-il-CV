import { Component } from '@angular/core';
import { CurriculumComponent } from "./curriculum/curriculum.component";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [CurriculumComponent],
})
export class AppComponent {
    
}
