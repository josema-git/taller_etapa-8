import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from './header.component';
import { AuthService } from '@/shared/services/auth.service';
import { PostsService } from '@/shared/services/posts.service';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;
  let router: Router;

  let authSpy: jasmine.SpyObj<AuthService>;
  let postsSpy: jasmine.SpyObj<PostsService>;
  let logoutSubject: Subject<{ message: string }>;

  let postsErrorSig: WritableSignal<string | null>;
  let postsSuccessSig: WritableSignal<string | null>;
  let authErrorSig: WritableSignal<string | null>;
  let authSuccessSig: WritableSignal<string | null>;

  beforeEach(async () => {
    postsErrorSig   = signal<string|null>(null);
    postsSuccessSig = signal<string|null>(null);
    authErrorSig    = signal<string|null>(null);
    authSuccessSig  = signal<string|null>(null);

    postsSpy = jasmine.createSpyObj(
      'PostsService',
      [],
      { error: postsErrorSig, success: postsSuccessSig }
    );

    authSpy = jasmine.createSpyObj(
      'AuthService',
      ['checkInitialState','isLoggedIn','profile','logout'],
      { error: authErrorSig, success: authSuccessSig }
    );
    authSpy.isLoggedIn.and.returnValue(false);
    logoutSubject = new Subject<{message:string}>();
    authSpy.logout.and.returnValue(logoutSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        HeaderComponent,
        RouterModule.forRoot([]),
      ],
      providers: [
        { provide: PostsService, useValue: postsSpy },
        { provide: AuthService,  useValue: authSpy }
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture.detectChanges();
  });

  it('llama a checkInitialState en el constructor', () => {
    expect(authSpy.checkInitialState).toHaveBeenCalled();
  });

  it('toggles mobile menu open/closed', () => {
    const btn = fixture.debugElement.query(
      By.css('button[aria-controls="navbar-hamburger"]')
    ).nativeElement as HTMLButtonElement;

    expect(component.isMenuOpen()).toBeFalse();

    btn.click();
    fixture.detectChanges();
    expect(component.isMenuOpen()).toBeTrue();

    btn.click();
    fixture.detectChanges();
    expect(component.isMenuOpen()).toBeFalse();
  });

  it('actualiza aria-expanded y clases block/hidden', () => {
    const btn = fixture.debugElement.query(
      By.css('button[aria-controls="navbar-hamburger"]')
    ).nativeElement as HTMLButtonElement;
    const menu = fixture.debugElement.query(
      By.css('#navbar-hamburger')
    ).nativeElement as HTMLElement;

    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(menu.classList).toContain('hidden');

    btn.click();
    fixture.detectChanges();

    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(menu.classList).toContain('block');
  });

  it('shows Login/Register when logged out', () => {
    authSpy.isLoggedIn.and.returnValue(false);
    fixture.detectChanges();

    const paths = fixture.debugElement
      .queryAll(By.css('#navbar-hamburger a[routerLink]'))
      .map(de => de.attributes['ng-reflect-router-link'] || de.attributes['routerlink']);

    expect(paths).toContain('/login');
    expect(paths).toContain('/register');
  });

  it('shows Welcome & Logout when logged in', () => {
    authSpy.isLoggedIn.and.returnValue(true);
    authSpy.profile.and.returnValue('Tester');
    fixture.detectChanges();

    const welcome = fixture.debugElement.query(
      By.css('#navbar-hamburger p')
    ).nativeElement as HTMLElement;
    expect(welcome.textContent).toContain('Welcome, Tester');

    expect(component.logoutStatus()).toBe('init');
    const logoutLink = fixture.debugElement.queryAll(
      By.css('#navbar-hamburger a')
    ).find(de => de.nativeElement.textContent.trim() === 'Logout');
    expect(logoutLink).toBeTruthy();
  });

  it('shows "Logging out..." while logout in progress', () => {
    authSpy.isLoggedIn.and.returnValue(true);
    authSpy.profile.and.returnValue('Tester');
    fixture.detectChanges();

    const logoutLink = fixture.debugElement.queryAll(
      By.css('#navbar-hamburger a')
    ).find(de => de.nativeElement.textContent.trim() === 'Logout')!;
    logoutLink.nativeElement.click();
    fixture.detectChanges();

    expect(component.logoutStatus()).toBe('loading');
    const loadingAnchor = fixture.debugElement.query(
      By.css('#navbar-hamburger li:nth-child(2) a')
    ).nativeElement as HTMLElement;
    expect(loadingAnchor.textContent).toContain('Logging out...');
  });

  it('calls auth.logout, navigates y pone success al completar', fakeAsync(() => {
    authSpy.isLoggedIn.and.returnValue(true);
    authSpy.profile.and.returnValue('Tester');
    const subj = new Subject<{message:string}>();
    authSpy.logout.and.returnValue(subj.asObservable());

    fixture.detectChanges();

    const logoutLink = fixture.debugElement.queryAll(
      By.css('#navbar-hamburger a')
    ).find(de => de.nativeElement.textContent.trim() === 'Logout')!;
    logoutLink.nativeElement.click();
    fixture.detectChanges();

    subj.next({ message: 'OK' });
    tick();
    fixture.detectChanges();

    expect(component.logoutStatus()).toBe('success');
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(authSpy.success()).toBe('Logout successful');
  }));

  it('muestra y quita banner de error global de postsService', () => {
    postsErrorSig.set('Error global');
    fixture.detectChanges();

    expect(component.error()).toBe('Error global');
    const banner = fixture.debugElement.query(By.css('div[role="alert"]'));
    expect(banner).toBeTruthy();
    expect(banner.query(By.css('strong')).nativeElement.textContent).toContain('Error global');

    banner.query(By.css('span')).nativeElement.click();
    fixture.detectChanges();
    expect(component.error()).toBeNull();
  });

  it('muestra y quita banner de éxito global de authService', () => {
    authSuccessSig.set('Todo bien');
    fixture.detectChanges();

    expect(component.success()).toBe('Todo bien');
    const banner = fixture.debugElement.query(By.css('div[role="alert"]'));
    expect(banner).toBeTruthy();
    expect(banner.query(By.css('strong')).nativeElement.textContent).toContain('Todo bien');

    banner.query(By.css('span')).nativeElement.click();
    fixture.detectChanges();
    expect(component.success()).toBeNull();
  });

  it('muestra y quita banner de éxito de postsService', () => {
    postsSuccessSig.set('¡Listo!');
    fixture.detectChanges();

    expect(component.success()).toBe('¡Listo!');
    const banner = fixture.debugElement.query(By.css('div[role="alert"]'));
    expect(banner).toBeTruthy();
    expect(banner.query(By.css('strong')).nativeElement.textContent).toContain('¡Listo!');

    banner.query(By.css('span')).nativeElement.click();
    fixture.detectChanges();
    expect(component.success()).toBeNull();
  });

  it('muestra y quita banner de error de authService', () => {
    authErrorSig.set('¡Error auth!');
    fixture.detectChanges();

    expect(component.error()).toBe('¡Error auth!');
    const banner = fixture.debugElement.query(By.css('div[role="alert"]'));
    expect(banner).toBeTruthy();
    expect(banner.query(By.css('strong')).nativeElement.textContent).toContain('¡Error auth!');

    banner.query(By.css('span')).nativeElement.click();
    fixture.detectChanges();
    expect(component.error()).toBeNull();
  });

  it('auto‐clear de banners tras 4 s', fakeAsync(() => {
    postsErrorSig.set('E1');
    postsSuccessSig.set('S1');
    authErrorSig.set('E2');
    authSuccessSig.set('S2');
    fixture.detectChanges();

    tick(4000);
    fixture.detectChanges();

    expect(component.error()).toBeNull();
    expect(component.success()).toBeNull();
  }));
});
