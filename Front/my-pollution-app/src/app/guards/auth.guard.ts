import { Injectable } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthState } from '../store/auth.state';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private store: Store, private router: Router) {}

  canActivate: CanActivateFn = (route, state) => {
    const isAuthenticated = this.store.selectSnapshot(AuthState.isAuthenticated);
    
    if (isAuthenticated) {
      return true;
    }
    
    this.router.navigate(['/login']);
    return false;
  };
}

export const authGuard: CanActivateFn = (route, state) => {
  const store = new Store();
  const router = new Router();
  const isAuthenticated = store.selectSnapshot(AuthState.isAuthenticated);
  
  if (isAuthenticated) {
    return true;
  }
  
  router.navigate(['/login']);
  return false;
};
