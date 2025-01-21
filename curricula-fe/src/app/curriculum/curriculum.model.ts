export interface Curriculum {
    id?: string;
    nome: string;
    cognome: string;
    indirizzo: string;
    telefono: string;
    email: string;
    website?: string;
    dataModifica?: string;
    esperienze?: {
        posizione: string;
        azienda: string;
        dataInizio: string | Date;
        dataFine?: string | Date;
        dettagli?: string;
    }[];
    studi?: {
        titolo: string;
        istituto: string;
        dataInizio: string | Date;
        dataFine?: string | Date;
        dettagli?: string;
    }[];
    lingue?: {
        [key: string]: {
            comprensione: string;
            parlato: string;
            scritto: string;
        };
    };
    skill?: {
        [key: string]: string[];
    };
}

export type Esperienze = Curriculum['esperienze'];
export type Studi = Curriculum['studi'];
export type Lingue = Curriculum['lingue'];
export type Skill = Curriculum['skill'];
