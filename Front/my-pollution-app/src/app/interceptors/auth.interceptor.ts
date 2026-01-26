import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { AuthState } from '../store/auth.state';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);
  const token = store.selectSnapshot(AuthState.token);
  
  // Cloner la requête et injecter le token si disponible
  const authReq = token ? req.clone({ 
    setHeaders: { 
      Authorization: `Bearer ${token}` 
    } 
  }) : req;
  
  return next(authReq);
};
