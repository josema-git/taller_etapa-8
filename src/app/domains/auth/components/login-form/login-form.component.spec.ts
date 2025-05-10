import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginFormComponent } from './login-form.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

class router {
  navigate = jasmine.createSpy('navigate');
}

describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;
  let mockRouter: router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([])],
      imports: [LoginFormComponent],
    });
    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it( 'should create login form', () => {
    expect(component).toBeTruthy();
  })
});
