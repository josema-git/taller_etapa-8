import { Component, inject, input, signal } from '@angular/core';
import { Post, Like, PaginatedResponse } from '@/shared/models/post';
import { DatePipe } from '@angular/common';
import PostsService from '@/shared/services/posts.service';

@Component({
  selector: 'app-post',
  imports: [DatePipe],
  templateUrl: './post.component.html',
})
export class PostComponent{
postsService = inject(PostsService);
post = input.required<Post>();
openPopup = signal(false);
likesResponse = signal<PaginatedResponse<Like>>({
  current_page: 1,
  total_count: 0,
  total_pages: 0,
  count: 0,
  next: null,
  previous: null,
  results: []
});

togglePopup() {
  this.openPopup.set(!this.openPopup());
}

getLikes( url?: string | null) {
  if (url) {
    this.postsService.getLikesByPostId(this.post().id, url).subscribe({
      next: (response) => {
        this.likesResponse.set(response)
      }
    });
    return;
  }
  this.postsService.getLikesByPostId(this.post().id).subscribe({
    next: (response) => {
      this.likesResponse.set(response)
    }
  });
}

toggleLike() {
  if (this.post().is_liked) {
    this.postsService.unlikePost(this.post().id).subscribe({
      next: () => {
        this.post().is_liked = false;
        this.post().likes -= 1;
      },
      error: (err) => {
        console.error(err);
      }
    });
  } else {
    this.postsService.likePost(this.post().id).subscribe({
      next: () => {
        this.post().is_liked = true;
        this.post().likes += 1;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}

}
