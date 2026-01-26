import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// ...existing code...
import { PollutionListComponent } from './pollution-list/pollution-list.component';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthState, Logout, InitAuth } from './store/auth.state';
import { FavoritesState } from './store/favorites.state';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, PollutionListComponent, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'my-pollution-app';
  isAuthenticated$!: Observable<boolean>;
  user$!: Observable<any>;
  favoriteCount$!: Observable<number>;

  constructor(private store: Store, private router: Router) {
    this.isAuthenticated$ = this.store.select(AuthState.isAuthenticated);
    this.user$ = this.store.select(AuthState.user);
    this.favoriteCount$ = this.store.select(FavoritesState.getFavoritesCount);
  }

  ngOnInit(): void {
    // Initialiser l'authentification depuis localStorage au démarrage
    this.store.dispatch(new InitAuth());
  }

  logout(): void {
    this.store.dispatch(new Logout()).subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}


