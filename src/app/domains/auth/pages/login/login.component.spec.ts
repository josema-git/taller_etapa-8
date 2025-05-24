import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import  LoginComponent  from './login.component';
import { AuthService } from '@/shared/services/auth.service';
import ListComponent from '@/posts/pages/list/list.component';

describe('LoginFormComponent', () => {
  let fixture:   ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let authSpy:   jasmine.SpyObj<AuthService>;
  let router:    Router;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        RouterModule.forRoot(
          [{path: '', component: ListComponent}]
        ),
      ],
      providers: [
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture   = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and have initial state', () => {
    expect(component).toBeTruthy();
    expect(component.status()).toBe('init');
    expect(component.showPassword()).toBeFalse();
  });

  it('toggles password visibility', () => {
    expect(component.showPassword()).toBeFalse();
    component.tooglePasswordVisibility();
    expect(component.showPassword()).toBeTrue();
  });

  describe('form validation', () => {
    it('invalid when empty or bad email', () => {
      const u = component.usernameCtrl;
      u.setValue('');
      component.loginForm.updateValueAndValidity();
      expect(u.hasError('required')).toBeTrue();

      u.setValue('bad');
      component.loginForm.updateValueAndValidity();
      expect(u.hasError('email')).toBeTrue();

      u.setValue('a@b.com');
      component.loginForm.updateValueAndValidity();
      expect(u.valid).toBeTrue();
    });

    it('password required', () => {
      const p = component.passwordCtrl;
      p.setValue('');
      component.loginForm.updateValueAndValidity();
      expect(p.hasError('required')).toBeTrue();

      p.setValue('secret');
      component.loginForm.updateValueAndValidity();
      expect(p.valid).toBeTrue();
    });
  });

  describe('login()', () => {
    const creds = { username: 'a@b.com', password: 'secret' };

    beforeEach(() => {
      component.usernameCtrl.setValue(creds.username);
      component.passwordCtrl.setValue(creds.password);
      component.loginForm.updateValueAndValidity();
      fixture.detectChanges();
    });

    it('does nothing if form invalid', () => {
      component.usernameCtrl.setValue('');
      component.loginForm.updateValueAndValidity();
      component.login();
      expect(authSpy.login).not.toHaveBeenCalled();
      expect(component.status()).toBe('init');
    });

    it('success path', (() => {
      authSpy.login.and.returnValue(of({ access: 'x', refresh: 'y' }));
      expect(component.status()).toBe('init');

      component.login();

      expect(component.status()).toBe('success');

      expect(router.navigate).toHaveBeenCalledWith(['/']);
    }));

    it('failure path (with console logs)', (() => {
      const err = { error: { message: 'Bad credentials' } };
      authSpy.login.and.returnValue(throwError(() => err));
      expect(component.status()).toBe('init');

      component.login();

      expect(component.status()).toBe('failed');
      expect(component.error()).toBe('Bad credentials');
      expect(component.passwordCtrl.value).toBe(''); // reset
    }));
  });

  it('disables submit when invalid or loading', () => {
    const btn = fixture.debugElement
      .query(By.css('button[type=submit]')).nativeElement as HTMLButtonElement;

    component.usernameCtrl.setValue('');
    component.passwordCtrl.setValue('');
    component.loginForm.updateValueAndValidity();
    fixture.detectChanges();
    expect(btn.disabled).toBeTrue();

    component.usernameCtrl.setValue('a@b.com');
    component.passwordCtrl.setValue('pw');
    component.loginForm.updateValueAndValidity();
    component.status.set('loading');
    fixture.detectChanges();
    expect(btn.disabled).toBeTrue();
  });
});
