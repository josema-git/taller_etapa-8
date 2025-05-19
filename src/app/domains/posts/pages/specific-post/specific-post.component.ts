import { Component, effect, inject, input, signal } from '@angular/core';
import { Post, Comment, PaginatedResponse } from '@/shared/models/post';
import { ActivatedRoute, RouterLinkWithHref } from '@angular/router';
import { PostsService } from '@/shared/services/posts.service';
import { CommentComponent } from '@/posts/components/comment/comment.component';
import { AddCommentFormComponent } from '@/posts/components/add-comment-form/add-comment-form.component';
import { PostComponent } from '@/posts/components/post/post.component';
import { AuthService } from '@/shared/services/auth.service';
import { EditPostComponent } from '@/posts/components/edit-post/edit-post.component';

@Component({
  selector: 'app-specific-post',
  imports: [CommentComponent, AddCommentFormComponent, PostComponent, RouterLinkWithHref, EditPostComponent],
  templateUrl: './specific-post.component.html',
})
export default class SpecificPostComponent {
  private route = inject(ActivatedRoute);
  private postsService = inject(PostsService);
  private authService = inject(AuthService);
  isloggedIn = this.authService.isLoggedIn;
  editing = this.postsService.editingPost;
  postId = signal(0);

  constructor() {
    effect(() => {
      const isLoggedInSpy = this.isloggedIn();
      
      this.postId.set(this.route.snapshot.params['postId']);
      this.getPost();
    })
  }

  post = this.postsService.detailedPost

  commentsResponse = this.postsService.commentsResponse;

  getPost() {
    this.postsService.getPost(this.postId())
  }

  getComments(url?: string | null): void {
    this.postsService.getCommentsByPostId(this.postId(), url)
  }

  addComment(comment: string) {
    this.postsService.addComment(this.postId(), comment);
  }
}
