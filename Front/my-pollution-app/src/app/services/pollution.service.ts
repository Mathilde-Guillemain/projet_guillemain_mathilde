import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { Pollution } from '../models/pollution.model';

@Injectable({
  providedIn: 'root'
})
export class PollutionService {
  private apiUrl = 'https://apitemplate-latest-ahqi.onrender.com/api/pollution';

  constructor(private http: HttpClient) {}

  getPollutions(): Observable<Pollution[]> {
    return this.http.get<Pollution[]>(this.apiUrl).pipe(
      catchError(err => {
        console.error('Erreur lors du chargement des pollutions', err);
        return throwError(() => new Error('Impossible de charger les pollutions'));
      })
    );
  }

  getPollutionById(id: number): Observable<Pollution> {
    return this.http.get<Pollution>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        console.error(`Erreur lors du chargement de la pollution ${id}`, err);
        return throwError(() => new Error('Pollution introuvable'));
      })
    );
  }

  getOne(id: number): Observable<Pollution> {
    return this.getPollutionById(id);
  }

  /**
   * Recherche dynamique de pollutions par titre, lieu ou type
   * Filtre côté client pour une réactivité instantanée
   * @param term Le terme de recherche
   */
  searchPollutions(term: string): Observable<Pollution[]> {
    if (!term.trim()) {
      return this.getPollutions();
    }
    
    const lowerTerm = term.toLowerCase();
    
    return this.getPollutions().pipe(
      map(pollutions => 
        pollutions.filter(p => {
          // Support des champs de l'API
          const titre = p.titre || '';
          const lieu = p.lieu || '';
          const type = p.type_pollution || '';
          
          return titre.toLowerCase().includes(lowerTerm) ||
                 lieu.toLowerCase().includes(lowerTerm) ||
                 type.toLowerCase().includes(lowerTerm);
        })
      ),
      tap(results => console.log(`Recherche '${term}': ${results.length} résultats trouvés`)),
      catchError(err => {
        console.error('Erreur lors de la recherche', err);
        return throwError(() => new Error('Erreur lors de la recherche'));
      })
    );
  }

  addPollution(pollution: any): Observable<any> {
    console.log('POST', this.apiUrl, pollution);
    return this.http.post<any>(this.apiUrl, pollution).pipe(
      tap(res => console.log('addPollution response', res)),
      catchError(err => {
        console.error('Erreur lors de l’ajout de la pollution', err);
        return throwError(() => new Error('Impossible d’ajouter la pollution'));
      })
    );
  }

  updatePollution(id: number, updated: any): Observable<any> {
    console.log('PUT', `${this.apiUrl}/${id}`, updated);
    return this.http.put<any>(`${this.apiUrl}/${id}`, updated).pipe(
      tap(res => console.log('updatePollution response', res)),
      catchError(err => {
        console.error(`Erreur lors de la mise à jour de la pollution ${id}`, err);
        return throwError(() => new Error('Impossible de modifier la pollution'));
      })
    );
  }

  deletePollution(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        console.error(`Erreur lors de la suppression de la pollution ${id}`, err);
        return throwError(() => new Error('Impossible de supprimer la pollution'));
      })
    );
  }
}
