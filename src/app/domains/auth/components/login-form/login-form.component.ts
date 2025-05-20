import { AuthService } from '@/shared/services/auth.service';
import { Component, signal, inject } from '@angular/core';
import { RouterLinkWithHref, Router } from '@angular/router';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

@Component({
  selector: 'app-login-form',
  imports: [
    RouterLinkWithHref,
    ReactiveFormsModule
  ],
  templateUrl: './login-form.component.html'
})
export class LoginFormComponent {
  error = signal<string | null>(null);
  status = signal<'init' | 'loading' | 'success' | 'failed'>('init');

  showPassword = signal(false);

  tooglePasswordVisibility() {
    this.showPassword.update((prev) => !prev);
  }

  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = new FormGroup({
    username: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.email,
      ]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
      ]
    })
  });

  get usernameCtrl() {
    return this.loginForm.controls.username;
  }
  get passwordCtrl() {
    return this.loginForm.controls.password;
  }

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.status.set('loading');

    const credentials = this.loginForm.getRawValue();

    this.authService.login(credentials).subscribe({
      next: () => {
        this.status.set('success');
        this.error.set(null);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.status.set('failed');
        this.error.set(err.error.message);
        this.loginForm.controls.password.reset();
      },
    });
  }
}
