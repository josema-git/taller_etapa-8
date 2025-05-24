// layout.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import  LayoutComponent  from './layout.component';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '@/shared/components/header/header.component';
import { Component, signal, WritableSignal } from '@angular/core';
import { AuthService } from '@/shared/services/auth.service';
import { PostsService } from '@/shared/services/posts.service';

@Component({ template: '<p data-testid="dummy">Ruta de prueba</p>' })
class DummyComponent {}

describe('LayoutComponent', () => {
  let fixture: ComponentFixture<LayoutComponent>;
  let router: Router;

  // Creamos spies ligeros de AuthService/PostsService
  const authErrorSig: WritableSignal<string|null>    = signal(null);
  const authSuccessSig: WritableSignal<string|null>  = signal(null);
  const postsErrorSig: WritableSignal<string|null>   = signal(null);
  const postsSuccessSig: WritableSignal<string|null> = signal(null);

  const authSpy = jasmine.createSpyObj(
    'AuthService',
    ['checkInitialState','isLoggedIn','profile','logout'],
    { error: authErrorSig, success: authSuccessSig }
  );
  authSpy.isLoggedIn.and.returnValue(false);

  const postsSpy = jasmine.createSpyObj(
    'PostsService',
    [],
    { error: postsErrorSig, success: postsSuccessSig }
  );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LayoutComponent,
        DummyComponent,
        RouterModule.forRoot([
          { path: 'dummy', component: DummyComponent }
        ])
      ],
      providers: [
        { provide: AuthService,  useValue: authSpy },
        { provide: PostsService, useValue: postsSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    router  = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create the layout', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the HeaderComponent', () => {
    const headerEl = fixture.debugElement.query(By.directive(HeaderComponent));
    expect(headerEl).toBeTruthy();
  });

  it('should have a RouterOutlet', () => {
    const outlet = fixture.debugElement.query(By.directive(RouterOutlet));
    expect(outlet).toBeTruthy();
  });

  it('should render routed component inside the outlet', fakeAsync(() => {
    router.navigate(['dummy']);
    tick();
    fixture.detectChanges();

    const dummyEl = fixture.debugElement.query(By.css('[data-testid="dummy"]'));
    expect(dummyEl).toBeTruthy();
    expect(dummyEl.nativeElement.textContent).toContain('Ruta de prueba');
  }));
});
