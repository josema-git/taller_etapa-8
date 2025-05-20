import { Component, effect, inject, signal } from '@angular/core';
import { RouterLinkWithHref } from '@angular/router';
import { AuthService } from '@/shared/services/auth.service';
import { PostsService } from '@/shared/services/posts.service';
import { tap } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLinkWithHref],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  authservice = inject(AuthService);
  postsService = inject(PostsService);
  router = inject(Router);
  isMenuOpen = signal<boolean>(false);
  logoutStatus = signal<'init' | 'loading' | 'success'>('init');
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  constructor() {
    this.authservice.checkInitialState();
    effect(() => {
      const error = this.postsService.error();
      this.error.set(error);

      if (error) {
        setTimeout(() => {
          this.postsService.error.set(null);
          this.error.set(null);
        }, 4000);
      }
    })
    effect(() => {
      const success = this.postsService.success();
      this.success.set(success);

      if (success) {
        setTimeout(() => {
          this.postsService.success.set(null);
          this.success.set(null);
        }, 4000);
      }
    })
    effect(() => {
      const error = this.authservice.error();
      this.error.set(error);

      if (error) {
        setTimeout(() => {
          this.authservice.error.set(null);
          this.error.set(null);
        }, 4000);
      }
    })
    effect(() => {
      const success = this.authservice.success();
      this.success.set(success);

      if (success) {
        setTimeout(() => {
          this.authservice.success.set(null);
          this.success.set(null);
        }, 4000);
      }
    })
  }

  toggleMenu(): void {
    this.isMenuOpen.update((value) => !value);
  }
  logout() {
    this.logoutStatus.set('loading');
    this.authservice.logout().subscribe({
      next: () => {
        this.logoutStatus.set('success');
        this.router.navigate(['/']);
        this.authservice.success.set('Logout successful');
      }
    })
  }
}

