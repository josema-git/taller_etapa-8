import { Component, inject, input, signal } from '@angular/core';
import { Post, Like, PaginatedResponse } from '@/shared/models/post';
import { DatePipe } from '@angular/common';
import PostsService from '@/shared/services/posts.service';
import { RouterLinkWithHref } from '@angular/router';

@Component({
  selector: 'app-post',
  imports: [DatePipe, RouterLinkWithHref],
  templateUrl: './post.component.html',
})
export class PostComponent {
  postsService = inject(PostsService);
  post = input.required<Post>();
  openPopup = signal(false);
  deleting = signal(false);
  likesResponse = signal<PaginatedResponse<Like>>({
    start_page: 0,
    count: 0,
    next: null,
    previous: null,
    results: []
  });

  togglePopup() {
    this.openPopup.set(!this.openPopup());
  }
  toggleDeleting() {
    this.deleting.set(!this.deleting());
  }

  getLikes(url?: string | null) {
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

  deletePost() {
    console.log(this.post().id);
    this.postsService.deletePost(this.post().id).subscribe({
      next: () => {
        this.postsService.fillPosts();
        this.toggleDeleting();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}