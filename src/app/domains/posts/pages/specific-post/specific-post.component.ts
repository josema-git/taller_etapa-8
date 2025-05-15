import { Component, inject, OnInit, signal } from '@angular/core';
import { Post, Comment, PaginatedResponse } from '@/shared/models/post';
import { ActivatedRoute } from '@angular/router';
import { PostsService } from '@/shared/services/posts.service';
import { DatePipe } from '@angular/common';
import { CommentComponent } from '@/posts/components/comment/comment.component';
import { AddCommentFormComponent } from '@/posts/components/add-comment-form/add-comment-form.component';

@Component({
  selector: 'app-specific-post',
  imports: [DatePipe, CommentComponent, AddCommentFormComponent],
  templateUrl: './specific-post.component.html',
})
export default class SpecificPostComponent  implements OnInit {
  private route = inject(ActivatedRoute);
  private postsService = inject(PostsService);
  postId = signal(0);

  post = signal<Post | null>(null)
  commentsResponse = signal<PaginatedResponse<Comment>>(
    {
      start_page: 0,
      count: 0,
      next: null,
      previous: null,
      results: [] as Comment[]
    }
  );

  ngOnInit(){
    this.postId.set(this.route.snapshot.params['postId']);
    this.getPost();
    this.getComments();
  }

  getPost() {
    this.postsService.getPost(this.postId()).subscribe({
      next: (response) => {
        this.post.set(response);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  getComments(url?: string | null) : void {
    this.postsService.getCommentsByPostId(this.postId(), url).subscribe({
      next: (response : PaginatedResponse<Comment>) => {
        this.commentsResponse.set(response);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  addComment(comment: string) {
    this.postsService.addComment(this.postId(), comment ).subscribe({
      next: (response) => { 
        this.getComments();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}
