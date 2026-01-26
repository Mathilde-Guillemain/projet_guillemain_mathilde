import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { FavoritesState, RemoveFavorite } from '../store/favorites.state';
import { Observable } from 'rxjs';
import { Pollution } from '../models/pollution.model';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  favorites$!: Observable<Pollution[]>;

  constructor(private store: Store) {}

  ngOnInit() {
    this.favorites$ = this.store.select(FavoritesState.getFavorites);
  }

  removeFavorite(id: number | undefined) {
    if (id) {
      this.store.dispatch(new RemoveFavorite(id));
    }
  }

  clearAll() {
    if (confirm('Êtes-vous sûr de vouloir supprimer tous les favoris ?')) {
      // Implémenter plus tard si besoin
    }
  }
}
