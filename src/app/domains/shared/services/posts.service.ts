import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from 'src/app/environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { Post, Like, PaginatedResponse, Comment } from '../models/post';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  editingPost = signal<number>(0);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  postsResponse = signal<PaginatedResponse<Post>>({
    start_page: 0,
    count: 0,
    next: null,
    previous: null,
    results: []
  });

  detailedPost = signal<Post>({
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
    author_permission: 0
  });

  commentsResponse = signal<PaginatedResponse<Comment>>({
    start_page: 0,
    count: 0,
    next: null,
    previous: null,
    results: []
  });

  getPosts(url: string | null = `${this.apiUrl}/post/`): Observable<PaginatedResponse<Post>> {
    const requestUrl = url || `${this.apiUrl}/post/`;
    return this.http.get<PaginatedResponse<Post>>(requestUrl).pipe(
      tap(response => this.postsResponse.set(response)),
      catchError((err: HttpErrorResponse) => {
        this.error.set(`Error fetching posts: ${err.message || err.error}`);
        return throwError(() => err);
      })
    );
  }

  getLikesByPostId(postId: number, url?: string | null): Observable<PaginatedResponse<Like>> {
    const requestUrl = url || `${this.apiUrl}/post/${postId}/likes/`;
    return this.http.get<PaginatedResponse<Like>>(requestUrl).pipe(
      catchError((err: HttpErrorResponse) => {
        this.error.set(`Error fetching likes: ${err.message}`);
        return of({ start_page: 0, count: 0, next: null, previous: null, results: [] });
      })
    );
  }

  getCommentsByPostId(postId: number, url?: string | null): Observable<PaginatedResponse<Comment>> {
    const requestUrl = url || `${this.apiUrl}/post/${postId}/comments/`;
    return this.http.get<PaginatedResponse<Comment>>(requestUrl).pipe(
      tap(response => this.commentsResponse.set(response)),
      catchError((err: HttpErrorResponse) => {
        this.error.set(`Error fetching comments: ${err.message}`);
        return of({ start_page: 0, count: 0, next: null, previous: null, results: [] });
      })
    );
  }

  likePost(postId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/post/${postId}/likes/`, {}).pipe(
      tap(() => {
        this.success.set('Post liked successfully');
        this.getLikesByPostId(postId).subscribe();
        this.getPost(postId).subscribe();
      }),
      catchError((err: HttpErrorResponse) => {
        this.error.set(`Error liking the post: ${err.message}`);
        return of({});
      })
    );
  }

  unlikePost(postId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/post/${postId}/unlikes/`).pipe(
      tap(() => {
        this.success.set('Post unliked successfully');
        this.getLikesByPostId(postId).subscribe();
        this.getPost(postId).subscribe();
      }),
      catchError((err: HttpErrorResponse) => {
        this.error.set(`Error unliking the post: ${err.message}`);
        // Return an empty Like to prevent errors in tests
        return of({});
      })
    );
  }

  deletePost(postId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/post/${postId}/`).pipe(
      tap(() => {
        this.success.set('Post deleted successfully');
        this.getPosts().subscribe();
      }),
      catchError((err: HttpErrorResponse) => {
        this.error.set(`Error deleting the post: ${err.message}`);
        return throwError(() => err);
      })
    );
  }

  resetPost(): void {
    this.detailedPost.set({
      id: 0,
      title: '',
      content: '',
      excerpt: '',
      author: '',
      created_at: '',
      likes: 0,
      comments: 0,
      is_liked: false,
      team: '',
      permission_level: 0,
      is_public: 0,
      authenticated_permission: 0,
      group_permission: 0,
      author_permission: 0
    });
    this.commentsResponse.set({
      start_page: 0,
      count: 0,
      next: null,
      previous: null,
      results: []
    });
  }

  getPost(postId: number, url?: string): Observable<any> {
    const requestUrl = url || `${this.apiUrl}/post/${postId}/`;
    return this.http.get<any>(requestUrl).pipe(
      tap(response => this.detailedPost.set(response)),
      catchError((err: HttpErrorResponse) => {
        console.error(`Error fetching post ${postId}:`, err.message);
        this.resetPost();
        return throwError(() => err);
      })
    );
  }

  addComment(postId: number, data: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/post/${postId}/comments/`, { content: data }).pipe(
      tap(() => {
        this.success.set('Comment added successfully');
        this.getCommentsByPostId(postId).subscribe();
      }),
      catchError((err: HttpErrorResponse) => {
        this.error.set(`Error adding comment: ${err.message}`);
        return throwError(() => err);
      })
    );
  }

  addPost(): Observable<any> {
    return this.http.post<Post>(`${this.apiUrl}/post/`, this.detailedPost()).pipe(
      tap(() => {
        this.success.set('Post added successfully');
        this.getPosts().subscribe();
      }),
      catchError((err: HttpErrorResponse) => {
        this.error.set(`Error adding post: ${err.message}`);
        return throwError(() => err);
      })
    );
  }

  editPost(post: Post): Observable<Post> {
    this.editingPost.set(post.id);
    return this.http.put<Post>(`${this.apiUrl}/post/${post.id}/`, post).pipe(
      tap(() => {
        this.success.set('Post edited successfully');
        this.getPost(post.id).subscribe();
      }),
      catchError((err: HttpErrorResponse) => {
        this.error.set(`Error editing post: ${err.message}`);
        return throwError(() => err);
      })
    );
  }
}
