import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { Login, Register } from '../store/auth.state';
import { AuthState } from '../store/auth.state';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  isRegisterMode = false;

  loading$;
  error$;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router
  ) {
    this.loading$ = this.store.select(AuthState.loading);
    this.error$ = this.store.select(AuthState.error);
  }

  ngOnInit(): void {
    this.initializeForms();
  }

  initializeForms(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: any } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.store.dispatch(new Login({ email, password }))
        .subscribe({
          next: () => {
            const user = this.store.selectSnapshot(AuthState.user);
            if (user) {
              this.router.navigate(['/pollutions']);
            }
          },
          error: (err) => {
            console.error('Login error:', err);
          }
        });
    }
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      const { name, email, password } = this.registerForm.value;
      this.store.dispatch(new Register({ name, email, password }))
        .subscribe({
          next: () => {
            const user = this.store.selectSnapshot(AuthState.user);
            if (user) {
              this.router.navigate(['/pollutions']);
            }
          },
          error: (err) => {
            console.error('Register error:', err);
          }
        });
    }
  }
}
