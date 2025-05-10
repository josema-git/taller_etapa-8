import { Component, effect, inject, signal } from '@angular/core';
import { RouterLinkWithHref } from '@angular/router';
import { AuthService } from '@/shared/services/auth.service';
import PostsService from '@/shared/services/posts.service';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [RouterLinkWithHref],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  authservice = inject(AuthService);
  postsService = inject(PostsService);
  isMenuOpen = signal<boolean>(false);

  constructor(){
    effect(() => {
      const isLoggedIn = this.authservice.isLoggedIn();
      if (isLoggedIn) {
        this.authservice.getProfile().subscribe();
      }
    })
  }

  toggleMenu() :void {
    this.isMenuOpen.update( (value) => !value);
  }
  logout(){
    this.authservice.logout();
    this.authservice.isLoggedIn.set(false);
    this.authservice.profile.set(null);
    this.postsService.fillPosts();
    this.isMenuOpen.set(false);
  }
}
