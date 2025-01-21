import {
    ApplicationConfig,
    Injectable,
    LOCALE_ID,
    provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import localeIt from '@angular/common/locales/it';
import {
    DateAdapter,
    MAT_DATE_FORMATS,
    MAT_NATIVE_DATE_FORMATS,
    NativeDateAdapter,
} from '@angular/material/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
registerLocaleData(localeIt);

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
    override parse(value: any, parseFormat?: any): Date | null {
        const date = super.parse(value, parseFormat);

        if (date) {
            const m = date.getMonth();
            date.setMonth(date.getDate() - 1);
            date.setDate(m + 1);
            return date;
        }

        return null;
    }
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(),
        provideAnimationsAsync(),
        { provide: DateAdapter, useClass: CustomDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },
        { provide: LOCALE_ID, useValue: 'it-IT' },
    ],
};
