export interface Pollution {
    id?: number;
    utilisateurId?: number;
    titre: string;
    type: string;
    description: string;
    date: string;
    lieu: string;
    latitude: number;
    longitude: number;
    photo: string;
    auteur?: {
        id: number;
        name: string;
        email: string;
    };
}