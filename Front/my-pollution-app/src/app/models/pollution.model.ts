export interface Pollution {
    id?: number;
    utilisateurId?: number;
    titre: string;
    type_pollution: string;
    description: string;
    date_observation: string;
    lieu: string;
    latitude: number;
    longitude: number;
    photo_url: string;
    auteur?: {
        id: number;
        name: string;
        email: string;
    };
}