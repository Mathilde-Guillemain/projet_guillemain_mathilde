import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  /**
   * Nettoie TOUS les tokens du localStorage
   * Appelé pour s'assurer qu'aucun token n'est exposé
   */
  clearAllTokens(): void {
    try {
      // Supprimer les clés courantes
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Option : Nettoyer tout le localStorage (plus agressif)
      // localStorage.clear();
      
      console.log('Tokens supprimés du localStorage');
    } catch (e) {
      console.error('Erreur lors du nettoyage du localStorage:', e);
    }
  }

  //Vérifie si localStorage contient des tokens
  hasTokensInStorage(): boolean {
    try {
      const keys = ['auth_token', 'token', 'access_token', 'refresh_token'];
      return keys.some(key => localStorage.getItem(key) !== null);
    } catch (e) {
      console.error('Erreur lors de la vérification du localStorage:', e);
      return false;
    }
  }

  //Obtient tous les items du localStorage (pour debug)
  getAllStorageItems(): { [key: string]: string } {
    try {
      const items: { [key: string]: string } = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          items[key] = localStorage.getItem(key) || '';
        }
      }
      return items;
    } catch (e) {
      console.error('Erreur lors de la lecture du localStorage:', e);
      return {};
    }
  }
}
