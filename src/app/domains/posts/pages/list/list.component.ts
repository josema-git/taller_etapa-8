import { PostsService } from '@/shared/services/posts.service';
import { Component, inject, signal } from '@angular/core';
import { PostComponent } from '@/posts/components/post/post.component';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-list',
  imports: [PostComponent],
  templateUrl: './list.component.html',
})
export default class ListComponent implements OnInit {
  postsService = inject(PostsService);

  error = signal<string | null>(null);

  ngOnInit() {
    this.postsService.getPosts();
  }
}
