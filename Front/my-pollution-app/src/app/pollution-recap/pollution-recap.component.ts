import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { PollutionService } from '../services/pollution.service';
import { User } from '../models/user.model';
import { Pollution } from '../models/pollution.model';

@Component({
  selector: 'app-pollution-recap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pollution-recap.component.html',
  styleUrls: ['./pollution-recap.component.css']
})
export class PollutionRecapComponent implements OnInit {
  pollutionData: Pollution | null = null;
  
  authorName = 'Inconnu';
  authorEmail = '';
  showFullImage = false;

  constructor(
    private userService: UserService,
    private pollutionService: PollutionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.pollutionService.getPollutionById(+id).subscribe({
        next: (pollution) => {
          this.pollutionData = pollution;
          this.resolveAuthor();
        },
        error: () => {
          this.router.navigate(['/pollutions']);
        }
      });
    }
  }

  //Résout l'auteur : priorité à l'objet inclus, sinon fetch par utilisateurId
  private resolveAuthor() {
    // Si l'API renvoie déjà l'auteur inclus
    if (this.pollutionData?.auteur) {
      this.authorName = this.pollutionData.auteur.name || 'Inconnu';
      this.authorEmail = this.pollutionData.auteur.email || '';
      return;
    }

    // Sinon, si on a l'ID utilisateur
    const userId = this.pollutionData?.utilisateurId;
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

  //Basculer l'affichage de l'image en plein écran
  toggleFullImage() {
    this.showFullImage = !this.showFullImage;
  }

  //Vérifier si la photo est en base64 ou URL
  isBase64Image(): boolean {
    const photo = this.getPhotoUrl();
    return photo ? photo.startsWith('data:image') : false;
  }

  //Obtenir l'URL de la photo
  getPhotoUrl(): string {
    return this.pollutionData?.photo_url || '';
  }

  //Formater la date
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  //Obtenir le nom de l'auteur (découvreur)
  getAuthorName(): string {
    return this.authorName || 'Inconnu';
  }


  goHome() {
    this.router.navigate(['/pollutions']);
  }
}
