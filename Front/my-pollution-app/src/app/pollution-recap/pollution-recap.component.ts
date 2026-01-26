import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pollution-recap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pollution-recap.component.html',
  styleUrls: ['./pollution-recap.component.css']
})
export class PollutionRecapComponent {
  @Input() pollutionData: any;
  @Output() homeClicked = new EventEmitter<void>();
  
  showFullImage = false;

  /**
   * Basculer l'affichage de l'image en plein écran
   */
  toggleFullImage() {
    this.showFullImage = !this.showFullImage;
  }

  /**
   * Vérifier si la photo est en base64 ou URL
   */
  isBase64Image(): boolean {
    const photo = this.getPhotoUrl();
    return photo ? photo.startsWith('data:image') : false;
  }

  /**
   * Obtenir l'URL de la photo (compatible avec l'ancien et le nouveau format)
   */
  getPhotoUrl(): string {
    return this.pollutionData?.photo || this.pollutionData?.photo_url || this.pollutionData?.photoUrl || '';
  }

  /**
   * Formater la date
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  goHome() {
    this.homeClicked.emit();
  }
}
