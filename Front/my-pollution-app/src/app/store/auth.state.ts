import { State, Action, StateContext, Selector, NgxsOnInit } from '@ngxs/store';
import { AuthService, User, AuthResponse } from '../services/auth.service';
import { Injectable } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { of, throwError } from 'rxjs';

// Storage key
const AUTH_STORAGE_KEY = 'auth_state';

// Actions
export class Register {
  static readonly type = '[Auth] Register';
  constructor(public payload: { name: string; email: string; password: string }) {}
}

export class Login {
  static readonly type = '[Auth] Login';
  constructor(public payload: { email: string; password: string }) {}
}

export class Logout {
  static readonly type = '[Auth] Logout';
}

export class LoadCurrentUser {
  static readonly type = '[Auth] Load Current User';
}

export class InitAuth {
  static readonly type = '[Auth] Initialize';
}

export class AuthError {
  static readonly type = '[Auth] Error';
  constructor(public payload: string) {}
}

// State Model
export interface AuthStateModel {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    user: null,
    token: null,
    loading: false,
    error: null
  }
})
@Injectable()
export class AuthState implements NgxsOnInit {
  constructor(private authService: AuthService) {}

  ngxsOnInit(ctx: StateContext<AuthStateModel>) {
    // Restaurer l'état depuis sessionStorage au démarrage
    const savedState = this.getSavedState();
    if (savedState) {
      ctx.patchState(savedState);
    }
  }

  private getSavedState(): AuthStateModel | null {
    try {
      const saved = sessionStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Erreur lecture sessionStorage:', e);
      return null;
    }
  }

  private saveState(state: AuthStateModel): void {
    try {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Erreur écriture sessionStorage:', e);
    }
  }

  private clearState(): void {
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error('Erreur suppression sessionStorage:', e);
    }
  }

  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    return !!state.token && !!state.user;
  }

  @Selector()
  static user(state: AuthStateModel): User | null {
    return state.user;
  }

  @Selector()
  static token(state: AuthStateModel): string | null {
    return state.token;
  }

  @Selector()
  static loading(state: AuthStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static error(state: AuthStateModel): string | null {
    return state.error;
  }

  @Action(Register)
  register(ctx: StateContext<AuthStateModel>, action: Register) {
    ctx.patchState({ loading: true, error: null });
    return this.authService.register(action.payload.name, action.payload.email, action.payload.password)
      .pipe(
        tap((response: AuthResponse) => {
          const newState = {
            user: {
              id: response.id,
              name: response.name,
              email: response.email
            },
            token: response.token,
            loading: false,
            error: null
          };
          ctx.patchState(newState);
          this.saveState(ctx.getState());
        }),
        catchError((error) => {
          const errorMessage = error.error?.message || 'Erreur lors de l\'enregistrement';
          ctx.patchState({
            loading: false,
            error: errorMessage,
            user: null,
            token: null
          });
          this.clearState();
          return of(null);
        })
      );
  }

  @Action(Login)
  login(ctx: StateContext<AuthStateModel>, action: Login) {
    ctx.patchState({ loading: true, error: null });
    return this.authService.login(action.payload.email, action.payload.password)
      .pipe(
        tap((response: AuthResponse) => {
          const newState = {
            user: {
              id: response.id,
              name: response.name,
              email: response.email
            },
            token: response.token,
            loading: false,
            error: null
          };
          ctx.patchState(newState);
          this.saveState(ctx.getState());
        }),
        catchError((error) => {
          const errorMessage = error.error?.message || 'Email ou mot de passe incorrect';
          ctx.patchState({
            loading: false,
            error: errorMessage,
            user: null,
            token: null
          });
          this.clearState();
          return of(null);
        })
      );
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({ loading: true });
    return this.authService.logout()
      .pipe(
        tap(() => {
          ctx.patchState({
            user: null,
            token: null,
            loading: false,
            error: null
          });
          this.clearState();
        })
      );
  }

  @Action(LoadCurrentUser)
  loadCurrentUser(ctx: StateContext<AuthStateModel>) {
    return this.authService.getCurrentUser()
      .pipe(
        tap((user: User) => {
          ctx.patchState({ user });
        })
      );
  }

  @Action(InitAuth)
  initAuth(ctx: StateContext<AuthStateModel>) {
    const state = ctx.getState();
    const token = state.token;
    if (token) {
      return this.authService.getCurrentUser()
        .pipe(
          tap((user: User) => {
            ctx.patchState({ user, token });
            this.saveState(ctx.getState());
          }),
          catchError(() => {
            // Si l'authentification échoue, nettoyer
            ctx.patchState({ token: null, user: null });
            this.clearState();
            return of(null);
          })
        );
    }
    return of(null);
  }
}