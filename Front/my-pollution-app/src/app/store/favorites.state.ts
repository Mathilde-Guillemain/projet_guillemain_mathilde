import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Pollution } from '../models/pollution.model';

// Actions
export class AddFavorite {
  static readonly type = '[Favorites] Add Favorite';
  constructor(public payload: Pollution) {}
}

export class RemoveFavorite {
  static readonly type = '[Favorites] Remove Favorite';
  constructor(public payload: number) {} // id de la pollution
}

export class ClearFavorites {
  static readonly type = '[Favorites] Clear Favorites';
}

export class InitializeFavorites {
  static readonly type = '[Favorites] Initialize Favorites';
  constructor(public payload: Pollution[]) {}
}

// State interface
export interface FavoritesStateModel {
  favorites: Pollution[];
}

@Injectable()
@State<FavoritesStateModel>({
  name: 'favorites',
  defaults: {
    favorites: []
  }
})
export class FavoritesState {
  private readonly STORAGE_KEY = 'favorites';

  constructor() {
    // Charger les favoris depuis localStorage au démarrage
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const favorites = JSON.parse(stored);
        // Les favoris seront mis à jour via InitializeFavorites action si besoin
      } catch (e) {
        console.error('Erreur lors du chargement des favoris', e);
      }
    }
  }

  @Selector()
  static getFavorites(state: FavoritesStateModel) {
    return state.favorites;
  }

  @Selector()
  static getFavoritesCount(state: FavoritesStateModel) {
    return state.favorites.length;
  }

  @Selector()
  static getFavoriteIds(state: FavoritesStateModel) {
    return state.favorites.map(f => f.id);
  }

  @Action(InitializeFavorites)
  initialize(ctx: StateContext<FavoritesStateModel>, action: InitializeFavorites) {
    ctx.setState({
      favorites: action.payload
    });
    this.saveFavorites(action.payload);
  }

  @Action(AddFavorite)
  addFavorite(ctx: StateContext<FavoritesStateModel>, action: AddFavorite) {
    const state = ctx.getState();
    const exists = state.favorites.some(f => f.id === action.payload.id);
    if (!exists) {
      const updated = [...state.favorites, action.payload];
      ctx.patchState({
        favorites: updated
      });
      this.saveFavorites(updated);
    }
  }

  @Action(RemoveFavorite)
  removeFavorite(ctx: StateContext<FavoritesStateModel>, action: RemoveFavorite) {
    const state = ctx.getState();
    const updated = state.favorites.filter(f => f.id !== action.payload);
    ctx.patchState({
      favorites: updated
    });
    this.saveFavorites(updated);
  }

  @Action(ClearFavorites)
  clearFavorites(ctx: StateContext<FavoritesStateModel>) {
    ctx.patchState({
      favorites: []
    });
    this.saveFavorites([]);
  }

  private saveFavorites(favorites: Pollution[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
  }
}
