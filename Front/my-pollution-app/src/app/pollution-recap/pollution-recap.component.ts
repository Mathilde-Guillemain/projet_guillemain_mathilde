import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';

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
  
  authorName = 'Inconnu';
  authorEmail = '';
  showFullImage = false;

  constructor(private userService: UserService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pollutionData'] && this.pollutionData) {
      this.resolveAuthor();
    }
  }

  /**
   * Résout l'auteur : priorité à l'objet inclus, sinon fetch par utilisateurId
   */
  private resolveAuthor() {
    // Si l'API renvoie déjà l'auteur inclus
    if (this.pollutionData?.auteur) {
      this.authorName = this.pollutionData.auteur.name || 'Inconnu';
      this.authorEmail = this.pollutionData.auteur.email || '';
      return;
    }

    // Sinon, si on a l'ID utilisateur
    const userId = this.pollutionData?.utilisateurId || this.pollutionData?.utilisateur_id;
    if (userId) {
      this.userService.getUserById(userId).subscribe({
        next: (user: User) => {
          this.authorName = user.name || 'Inconnu';
          this.authorEmail = user.email || '';
        },
        error: () => {
          this.authorName = 'Inconnu';
          this.authorEmail = '';
        }
      });
    } else {
      this.authorName = 'Inconnu';
      this.authorEmail = '';
    }
  }

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

  /**
   * Obtenir le nom de l'auteur (découvreur)
   */
  getAuthorName(): string {
    return this.authorName || 'Inconnu';
  }


  goHome() {
    this.homeClicked.emit();
  }
}
