import { PollutionFormComponent } from '../pollution-form/pollution-form.component';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PollutionService} from '../services/pollution.service';
import { Pollution } from '../models/pollution.model';
// ...existing code...
import { PollutionRecapComponent } from '../pollution-recap/pollution-recap.component';
import { Store } from '@ngxs/store';
import { AddFavorite, RemoveFavorite, FavoritesState } from '../store/favorites.state';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-pollution-list',
  standalone: true,
  imports: [CommonModule, PollutionFormComponent, PollutionRecapComponent],
  templateUrl: './pollution-list.component.html',
  styleUrls: ['./pollution-list.component.css']
})
export class PollutionListComponent implements OnInit {
  pollutions$!: Observable<Pollution[]>;
  favoritesIds: number[] = [];
  showForm = false;
  pollutionToEdit: Pollution | null = null;
  selectedPollution: Pollution | null = null;

  constructor(private pollutionService: PollutionService, private store: Store) {}

  ngOnInit() {
    this.pollutions$ = this.pollutionService.getPollutions();
    // Abonner aux IDs des favoris
    this.store.select(FavoritesState.getFavoriteIds).subscribe(ids => {
      this.favoritesIds = ids?.filter((id): id is number => id !== undefined) || [];
    });
  }

  isFavorite(id: number | undefined): boolean {
    return id ? this.favoritesIds.includes(id) : false;
  }

  toggleFavorite(pollution: Pollution) {
    if (pollution.id) {
      if (this.isFavorite(pollution.id)) {
        this.store.dispatch(new RemoveFavorite(pollution.id));
      } else {
        this.store.dispatch(new AddFavorite(pollution));
      }
    }
  }

  addNew() {
  this.pollutionToEdit = null;
  this.showForm = true;
  this.selectedPollution = null;
  }

  edit(p: Pollution) {
  this.pollutionToEdit = p;
  this.showForm = true;
  this.selectedPollution = null;
  }


  delete(p: Pollution) {
    if (!p.id) return;
    if (confirm('Êtes-vous sûr de vouloir supprimer cette pollution?')) {
      this.pollutionService.deletePollution(p.id).subscribe({
        next: () => {
          this.refreshList();
          this.selectedPollution = null;
        },
        error: (err) => {
          console.error('Delete error:', err);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }


  refreshList() {
    this.pollutions$ = this.pollutionService.getPollutions();
  }

  showDetails(p: Pollution) {
    this.selectedPollution = p;
    this.showForm = false;
  }

  formClosed() {
  this.showForm = false;
  this.refreshList();
  this.selectedPollution = null;
}


}
