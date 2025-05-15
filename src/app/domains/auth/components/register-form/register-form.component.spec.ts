import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterFormComponent } from './register-form.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

class router {
  navigate = jasmine.createSpy('navigate');
}

describe('RegisterFormComponent', () => {
  let component: RegisterFormComponent;
  let fixture: ComponentFixture<RegisterFormComponent>;
  let mockRouter: router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([])],
      imports: [RegisterFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('RegisterFormComponent', () => {
  let component: RegisterFormComponent;
  let fixture: ComponentFixture<RegisterFormComponent>;
  let mockRouter: router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([])],
      imports: [RegisterFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should disable the button because of empty form', () => {
    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(true);
  });

  it ('should disable the button because of invalid form mail', () => {
    component.registerForm.controls['username'].setValue('testuser');
    component.registerForm.controls['password'].setValue('testpassword');
    component.registerForm.controls['confirmPassword'].setValue('testpassword');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(true);
  });

  it ('should disable the button because of different confirm password', () => {
    component.registerForm.controls['username'].setValue('testuser@gmail.com');
    component.registerForm.controls['password'].setValue('test');
    component.registerForm.controls['confirmPassword'].setValue('differentpassword');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(true);
  });

  it('should disable the button because of empty username', () => {
    component.registerForm.controls['username'].setValue('');
    component.registerForm.controls['password'].setValue('testpassword');
    component.registerForm.controls['confirmPassword'].setValue('testpassword');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(true);
  });

  it('should disable the button because of empty password', () => {
    component.registerForm.controls['username'].setValue('testuser@gmail.com');
    component.registerForm.controls['password'].setValue('');
    component.registerForm.controls['confirmPassword'].setValue('testpassword');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(true);
  });
  it('should disable the button because of empty confirm password', () => {
    component.registerForm.controls['username'].setValue('testuser@gmail.com');
    component.registerForm.controls['password'].setValue('testpassword');
    component.registerForm.controls['confirmPassword'].setValue('');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(true);
  });

  it('should disable the button because of empty all fields', () => {
    component.registerForm.controls['username'].setValue('');
    component.registerForm.controls['password'].setValue('');
    component.registerForm.controls['confirmPassword'].setValue('');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(true);
  });

  it('should enable the button because of valid form', () => {
    component.registerForm.controls['username'].setValue('testuser@gmail.com');
    component.registerForm.controls['password'].setValue('testpassword');
    component.registerForm.controls['confirmPassword'].setValue('testpassword');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(false);
  });
});
