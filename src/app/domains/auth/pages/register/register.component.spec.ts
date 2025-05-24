import { Component, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule }                                  from '@angular/forms';
import { Router, RouterModule }                                 from '@angular/router';
import { By }                                                  from '@angular/platform-browser';
import { of, throwError }                                      from 'rxjs';

import RegisterComponent,{
  passwordsMatchValidator
} from './register.component';
import { AuthService }                                         from '@/shared/services/auth.service';

@Component({ template: '' })
class DummyLoginComponent {}

describe('RegisterComponent', () => {
  let fixture:   ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;
  let authSpy:   jasmine.SpyObj<AuthService>;
  let router:    Router;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        ReactiveFormsModule,
        RouterModule.forRoot([
          { path: 'login', component: DummyLoginComponent }
        ])
      ],
      providers: [
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture   = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and have default state', () => {
    expect(component).toBeTruthy();
    expect(component.status()).toBe('init');
    expect(component.error()).toBeNull();
  });

  describe('passwordsMatchValidator', () => {
    const grp = () => component.registerForm;

    it('returns null when passwords match', () => {
      grp().get('password')!.setValue('abc');
      grp().get('confirmPassword')!.setValue('abc');
      expect(passwordsMatchValidator(grp())).toBeNull();
    });

    it('returns an error when they differ', () => {
      grp().get('password')!.setValue('a');
      grp().get('confirmPassword')!.setValue('b');
      expect(passwordsMatchValidator(grp())).toEqual({ passwordsMismatch: true });
    });
  });

  it('disables submit when invalid or loading', () => {
    const btn = fixture.debugElement
      .query(By.css('button[type=submit]'))
      .nativeElement as HTMLButtonElement;

    component.username.setValue('');
    component.password.setValue('');
    component.confirmPassword.setValue('');
    component.registerForm.updateValueAndValidity();
    fixture.detectChanges();
    expect(btn.disabled).toBeTrue();

    component.username.setValue('u@v.com');
    component.password.setValue('pw');
    component.confirmPassword.setValue('pw');
    component.registerForm.updateValueAndValidity();
    component.status.set('loading');
    fixture.detectChanges();
    expect(btn.disabled).toBeTrue();
  });

  describe('register()', () => {
    const creds = { username: 'u@v.com', password: 'pw', confirmPassword: 'pw' };

    beforeEach(() => {
      component.username.setValue(creds.username);
      component.password.setValue(creds.password);
      component.confirmPassword.setValue(creds.confirmPassword);
      component.registerForm.updateValueAndValidity();
      fixture.detectChanges();
    });

    it('does nothing if the form is invalid', () => {
      component.confirmPassword.setValue('no-match');
      component.registerForm.updateValueAndValidity();
      component.register();
      expect(authSpy.register).not.toHaveBeenCalled();
      expect(component.status()).toBe('init');
    });

    it('navigates to /login on success', (() => {
      authSpy.register.and.returnValue(of({ message: 'OK' }));
      expect(component.status()).toBe('init');

      component.register();

      expect(authSpy.register).toHaveBeenCalledWith(creds);
      expect(component.status()).toBe('success');
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    }));

    it('displays error on failure', (() => {
      const err = { error: { message: 'Taken' } };
      authSpy.register.and.returnValue(throwError(() => err));
      expect(component.status()).toBe('init');

      component.register();

      expect(component.status()).toBe('failed');
      expect(component.error()).toBe('Taken');
    }));
  });
});

