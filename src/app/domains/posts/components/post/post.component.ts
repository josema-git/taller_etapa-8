import { Component, inject, input, signal } from '@angular/core';
import { Post, Like, PaginatedResponse } from '@/shared/models/post';
import { DatePipe } from '@angular/common';
import { PostsService } from '@/shared/services/posts.service';
import { RouterLinkWithHref } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
// @ts-ignore
import truncate from 'html-truncate';


function generateExcerpt(html: string, length: number = 200, postId?: number): string {
  const truncated = truncate(html, length);
  const viewMore = postId
    ? `<p><a href="/post/${postId}" class="text-blue-400" >View more...</a></p>`
    : '';
  return truncated + viewMore;
}

@Component({
  selector: 'app-post',
  imports: [DatePipe, RouterLinkWithHref],
  templateUrl: './post.component.html',
})
export class PostComponent {
  postsService = inject(PostsService);
  post = input.required<Post>();
  detail = input<boolean>(false);
  openPopup = signal(false);
  deleting = signal(false);
  editing = this.postsService.editingPost;
  sanitizedContent: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    const raw = this.post().content;
    const html = this.detail() ? raw : generateExcerpt(raw, 200, this.post().id);
    this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(html);
  }

  likesResponse = signal<PaginatedResponse<Like>>({
    start_page: 0,
    count: 0,
    next: null,
    previous: null,
    results: []
  });

  toggleEditingPost() {
    this.postsService.editingPost.set(this.post().id);
  }

  resetEditingPost() {
    this.postsService.editingPost.set(0);
  }

  togglePopup() {
    this.openPopup.set(!this.openPopup());
  }
  toggleDeleting() {
    this.deleting.set(!this.deleting());
  }

  getLikes(url?: string | null) {
    this.postsService.getLikesByPostId(this.post().id, url).subscribe({
      next: (res) => {
        this.likesResponse.set(res);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  toggleLike() {
    if (this.post().is_liked) {
      this.postsService.unlikePost(this.post().id).subscribe(
        () => {
          this.post().is_liked = false;
        }
      );
    } else {
      this.postsService.likePost(this.post().id).subscribe(
        () => {
          this.post().is_liked = true;
        }
      );
    }
  }

  deletePost() {
    this.deleting.set(false);
    this.postsService.deletePost(this.post().id).subscribe();
  }
}