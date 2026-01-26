import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  /**
   * Convertit un fichier image en base64
   * @param file Le fichier image à convertir
   * @returns Observable avec la string base64
   */
  convertToBase64(file: File): Observable<string> {
    return from(
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        
        reader.onerror = () => {
          reject(new Error('Erreur lors de la lecture du fichier'));
        };
        
        reader.readAsDataURL(file);
      })
    );
  }

  /**
   * Valide un fichier image
   * @param file Le fichier à valider
   * @param maxSizeInMB Taille maximale en MB (par défaut 5MB)
   * @returns true si valide, sinon false
   */
  isValidImage(file: File, maxSizeInMB: number = 5): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    
    // Vérifier le type
    if (!allowedTypes.includes(file.type)) {
      console.error('Type de fichier non autorisé. Formats acceptés: JPG, PNG, GIF, WebP');
      return false;
    }
    
    // Vérifier la taille
    if (file.size > maxSizeInBytes) {
      console.error(`Fichier trop volumineux. Maximum: ${maxSizeInMB}MB`);
      return false;
    }
    
    return true;
  }

  /**
   * Obtient l'extension du fichier
   * @param file Le fichier
   * @returns L'extension (jpg, png, etc)
   */
  getFileExtension(file: File): string {
    const type = file.type.split('/')[1];
    return type || 'jpg';
  }

  /**
   * Compresse une image base64 (optionnel)
   * Utile pour réduire encore la taille
   * @param base64String La string base64
   * @param quality La qualité (0-1)
   * @returns Observable avec l'image compressée
   */
  compressImage(base64String: string, quality: number = 0.8): Observable<string> {
    return from(
      new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.src = base64String;
        
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              reject(new Error('Impossible de créer un canvas'));
              return;
            }
            
            // Définir les dimensions du canvas
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Dessiner l'image
            ctx.drawImage(img, 0, 0);
            
            // Convertir en base64 avec la qualité spécifiée
            const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedBase64);
          } catch (error) {
            reject(error);
          }
        };
        
        img.onerror = () => {
          reject(new Error('Erreur lors du chargement de l\'image'));
        };
      })
    );
  }
}
