import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@/shared/services/auth.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-register-form',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register-form.component.html'
})
export class RegisterFormComponent {
  error = signal<string | null>(null);
  status = signal<'init' | 'loading' | 'success' | 'failed'>('init');

  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm = new FormGroup(
    {
      username: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
      password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    },
    { validators: passwordsMatchValidator }
  )

  get username() {
    return this.registerForm.controls.username
  }
  get password() {
    return this.registerForm.controls.password
  }
  get confirmPassword() {
    return this.registerForm.controls.confirmPassword
  }

  register() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.status.set('loading');
    this.error.set(null);

    const credentials = this.registerForm.getRawValue();

    this.authService.register(credentials.username, credentials.password)
      .subscribe({
        next: (response) => {
          this.status.set('success');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.status.set('failed');
          this.error.set(err.error.message);
        }
      });

  }
}

export function passwordsMatchValidator(control: AbstractControl) {
  const password = control.get('password')?.value;
  const confirmPass = control.get('confirmPassword')?.value;

  if (!password || !confirmPass) {
    return null;
  }

  if (password !== confirmPass) {
    return { passwordsMismatch: true };
  }
  return null;
}
