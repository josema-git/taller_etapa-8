import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from 'src/app/environments/environment';
import { catchError } from 'rxjs/operators'; 
import { Post, Like, PaginatedResponse, Comment } from '../models/post';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostsService { 
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  editingPost = signal<number>(0);
  Error = signal<string | null>(null);

  postsResponse = signal<PaginatedResponse<Post>>(
    {
      start_page: 0,
      count: 0,
      next: null,
      previous: null,
      results: []
    }
  );

  detailedPost = signal<Post>(
    {
      id: 0,
      title: '',
      content: '',
      excerpt: '',
      likes: 0,
      comments: 0,
      is_liked: false,
      created_at: '',
      author: '',
      team: '',
      permission_level: 0,
      is_public: 0,
      authenticated_permission: 0,
      group_permission: 0,
      author_permission: 0,
    }
  );

  commentsResponse = signal<PaginatedResponse<Comment>>(
    {
      start_page: 0,
      count: 0,
      next: null,
      previous: null,
      results: [] as Comment[]
    }
  );

  getPosts(url: string | null = `${this.apiUrl}/post/`) {
    const requestUrl = url || `${this.apiUrl}/post/`;
    this.http.get<PaginatedResponse<Post>>(requestUrl).pipe(
      catchError((err: HttpErrorResponse) => {
        this.Error.set(`Error fetching posts: ${err.message}`);
        return throwError(() => err);
      })
    ).subscribe({
      next: (response) => this.postsResponse.set(response),
      error: (err: HttpErrorResponse) => this.Error.set(`Error fetching posts: ${err.message}`)
    });
  }

  getLikesByPostId(postId: number, url?: string | null): Observable<PaginatedResponse<Like>> {
    const requestUrl = url || `${this.apiUrl}/post/${postId}/likes/`;
    return this.http.get<PaginatedResponse<Like>>(requestUrl).pipe(
      catchError((err: HttpErrorResponse) => {
        this.Error.set(`Error fetching likes: ${err.message}`);
        return of({ start_page: 0, count: 0, next: null, previous: null, results: [] as Like[] });
      })
    );
  }

  getCommentsByPostId(postId: number, url?: string | null): void{
    const requestUrl = url || `${this.apiUrl}/post/${postId}/comments/`;
    this.http.get<PaginatedResponse<Comment>>(requestUrl).pipe(
      catchError((err: HttpErrorResponse) => {
        this.Error.set(`Error fetching comments: ${err.message}`);
        return of({ start_page: 0, count: 0, next: null, previous: null, results: [] as Comment[] });
      })
    ).subscribe({
      next: (response) => this.commentsResponse.set(response),
      error: (err: HttpErrorResponse) => this.Error.set(`Error fetching comments: ${err.message}`)
    });
  }

  likePost(postId: number): void { 
    this.http.post<Like>(`${this.apiUrl}/post/${postId}/likes/`, {}).pipe(
      catchError((err: HttpErrorResponse) => {
        this.Error.set(`Error liking the post: ${err.message}`);
        return throwError(() => err);
      })
    ).subscribe({
      next: () => {
        this.getLikesByPostId(postId);
        this.getPost(postId);
      },
      error: (err: HttpErrorResponse) => this.Error.set(`Error liking the post: ${err.message}`)
    });
  }

  unlikePost(postId: number): void {
    this.http.delete<Like>(`${this.apiUrl}/post/${postId}/likes/`).pipe(
      catchError((err: HttpErrorResponse) => {
        this.Error.set(`Error unliking the post: ${err.message}`);
        return throwError(() => err);
      })
    ).subscribe({
      next: () => {
        this.getLikesByPostId(postId);
        this.getPost(postId);
      },
      error: (err: HttpErrorResponse) => this.Error.set(`Error unliking the post: ${err.message}`)
    });
  }

  deletePost(postId: number): void { 
    this.http.delete<Post>(`${this.apiUrl}/post/${postId}/`).pipe(
      catchError((err: HttpErrorResponse) => {
        this.Error.set(`Error deleting the post: ${err.message}`);
        return throwError(() => err);
      })
    ).subscribe({
      next: () => {
        this.getPosts();
        this.resetPost();
      },
      error: (err: HttpErrorResponse) => this.Error.set(`Error deleting the post: ${err.message}`)
    });
  }

  resetPost(){
    this.detailedPost.set({
      id: 0,
      title: '',
      content: '',
      excerpt: '',
      author: '',
      created_at: '',
      likes: 0,
      comments: 0,
      team: '',
      permission_level: 0,
      is_liked: false,
      is_public: 0,
      authenticated_permission: 0,
      group_permission: 0,
      author_permission: 0,
    });
    this.commentsResponse.set({
      start_page: 0,
      count: 0,
      next: null,
      previous: null,
      results: [] as Comment[]
    });
  }

  getPost(postId: number, url?: string): void {
    const requestUrl = url || `${this.apiUrl}/post/${postId}/`;
    this.http.get<Post>(requestUrl).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error getting the post with id ${postId}:`, err.message);
        this.resetPost();
        return throwError(() => err);
      })
    ).subscribe({
      next: (response) => {
        this.detailedPost.set(response); 
        this.getCommentsByPostId(postId);
      },
      error: (err: HttpErrorResponse) => this.Error.set(`Error fetching post: ${err.message}`)
    });
  }

  addComment(postId: number, data: string): void {
    this.http.post<Comment>(`${this.apiUrl}/post/${postId}/comments/`, { content: data }).pipe(
      catchError((err: HttpErrorResponse) => {
        this.Error.set(`Error adding comment: ${err.message}`);
        return throwError(() => err);
      })
    ).subscribe({
      next: () => {
        this.getCommentsByPostId(postId);
      },
      error: (err: HttpErrorResponse) => this.Error.set(`Error adding comment: ${err.message}`)
    });
  }

  addPost(): void {
    this.http.post<Post>(`${this.apiUrl}/post/`, this.detailedPost()).pipe(
      catchError((err: HttpErrorResponse) => {
        this.Error.set(`Error adding post: ${err.message}`);
        return throwError(() => err);
      })
    ).subscribe({
      next: () => {
        this.getPosts();
      },
      error: (err: HttpErrorResponse) => this.Error.set(`Error adding post: ${err.message}`)
    });
  }

  editPost(post: Post): void {
    this.http.put<Post>(`${this.apiUrl}/post/${post.id}/`, post).pipe(
      catchError((err: HttpErrorResponse) => {
        this.Error.set(`Error editing post: ${err.message}`);
        return throwError(() => err);
      })
    ).subscribe({
      next: () => {
        this.editingPost.set(0);
        this.getPost(post.id);
      },
      error: (err: HttpErrorResponse) => this.Error.set(`Error editing post: ${err.message}`)
    });
  }

}
