// src/app/domains/posts/pages/specific-post/specific-post.component.ts

import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule }                      from '@angular/common';
import { ActivatedRoute, RouterLinkWithHref } from '@angular/router';

import { PostsService }        from '@/shared/services/posts.service';
import { AuthService }         from '@/shared/services/auth.service';
import { PostComponent }       from '@/posts/components/post/post.component';
import { CommentComponent }    from '@/posts/components/comment/comment.component';
import { AddCommentFormComponent } from '@/posts/components/add-comment-form/add-comment-form.component';
import { EditPostComponent }   from '@/posts/components/edit-post/edit-post.component';

@Component({
  selector: 'app-specific-post',
  standalone: true,
  imports: [
    RouterLinkWithHref,
    PostComponent,
    CommentComponent,
    AddCommentFormComponent,
    EditPostComponent
  ],
  templateUrl: './specific-post.component.html',
})
export default class SpecificPostComponent {
  private route       = inject(ActivatedRoute);
  private postsService = inject(PostsService);
  private authService  = inject(AuthService);

  isloggedIn       = this.authService.isLoggedIn;
  editing          = this.postsService.editingPost;
  postsStatus      = signal<'init' | 'loading' | 'success'>('init');
  commentsStatus   = signal<'init' | 'loading' | 'success'>('init');
  postId           = signal(0);
  post             = this.postsService.detailedPost;
  commentsResponse = this.postsService.commentsResponse;

  constructor() {
    effect(() => {
      this.postId.set(this.route.snapshot.params['postId']);
      this.getPost();
    });
  }

  getPost() {
    this.postsStatus.set('loading');
    this.postsService.getPost(this.postId()).subscribe({
      next: () => {
        this.postsStatus.set('success');
        this.getComments();
      }
    });
  }

  getComments(url?: string | null) {
    this.commentsStatus.set('loading');
    this.postsService.getCommentsByPostId(this.postId(), url).subscribe({
      next: () => this.commentsStatus.set('success')
    });
  }
}
