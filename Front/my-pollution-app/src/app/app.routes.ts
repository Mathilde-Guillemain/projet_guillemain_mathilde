import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { PollutionListComponent } from './pollution-list/pollution-list.component';
import { PollutionFormComponent } from './pollution-form/pollution-form.component';
import { PollutionRecapComponent } from './pollution-recap/pollution-recap.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { LoginComponent } from './login/login.component';
import { AuthState } from './store/auth.state';

const authGuard = (route: any, state: any) => {
  const store = inject(Store);
  const router = inject(Router);
  
  // Vérifier l'authentification via le store
  const isAuth = store.selectSnapshot(AuthState.isAuthenticated);
  
  return isAuth ? true : router.createUrlTree(['/login']);
};

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'pollutions', pathMatch: 'full' },
  { 
    path: 'pollutions', 
    component: PollutionListComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'pollution/new', 
    component: PollutionFormComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'pollution/edit/:id', 
    component: PollutionFormComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'pollution/:id', 
    component: PollutionRecapComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'favorites', 
    component: FavoritesComponent,
    canActivate: [authGuard]
  },
];