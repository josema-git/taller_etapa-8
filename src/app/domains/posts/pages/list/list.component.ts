import { PostsService } from '@/shared/services/posts.service';
import { Component, effect, inject, signal } from '@angular/core';
import { PostComponent } from '@/posts/components/post/post.component';
import { RouterLinkWithHref } from '@angular/router';
import { AuthService } from '@/shared/services/auth.service';

@Component({
  selector: 'app-list',
  imports: [PostComponent, RouterLinkWithHref],
  templateUrl: './list.component.html',
})
export default class ListComponent  {
  postsService = inject(PostsService);
  authService = inject(AuthService);
  isloggedIn = this.authService.isLoggedIn;

  error = signal<string | null>(null);

  constructor(){
    effect(() => {
      const loggedinSpy = this.authService.isLoggedIn();
      this.postsService.getPosts().subscribe();
    })
  }
}
