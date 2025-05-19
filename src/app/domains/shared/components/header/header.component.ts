import { Component, effect, inject, signal } from '@angular/core';
import { RouterLinkWithHref } from '@angular/router';
import { AuthService } from '@/shared/services/auth.service';
import { PostsService } from '@/shared/services/posts.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLinkWithHref],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  authservice = inject(AuthService);
  postsService = inject(PostsService);
  isMenuOpen = signal<boolean>(false);
  error = this.postsService.Error;

  constructor() {
    this.authservice.checkInitialState();
    effect(() => {
      const error = this.postsService.Error();

      if (error){
        setTimeout(() => {
          this.postsService.Error.set(null);
        }, 4000);
      }
  })
  }

  toggleMenu(): void {
    this.isMenuOpen.update((value) => !value);
  }
  logout() {
    this.authservice.logout().pipe(
      tap(() => {
        this.authservice.LocalLogout();
        this.postsService.getPosts();
      })
    ).subscribe();
  }
}

