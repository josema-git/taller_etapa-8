import { PostsService } from '@/shared/services/posts.service';
import { Component, inject, signal } from '@angular/core';
import { PostComponent } from '@/posts/components/post/post.component';
import { OnInit } from '@angular/core';
import { RouterLinkWithHref } from '@angular/router';

@Component({
  selector: 'app-list',
  imports: [PostComponent, RouterLinkWithHref],
  templateUrl: './list.component.html',
})
export default class ListComponent implements OnInit {
  postsService = inject(PostsService);

  error = signal<string | null>(null);

  ngOnInit() {
    this.postsService.getPosts();
  }
}
