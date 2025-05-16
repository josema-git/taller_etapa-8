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
        console.error('Error al obtener posts:', err.message);
        return throwError(() => err);
      })
    ).subscribe({
      next: (response) => this.postsResponse.set(response),
      error: (err: HttpErrorResponse) => console.error('Error en fetchPosts:', err)
    });
  }

  getLikesByPostId(postId: number, url?: string | null): Observable<PaginatedResponse<Like>> {
    const requestUrl = url || `${this.apiUrl}/post/${postId}/likes/`;
    return this.http.get<PaginatedResponse<Like>>(requestUrl).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al obtener likes para el post ${postId}:`, err.message);
        return of({ start_page: 0, count: 0, next: null, previous: null, results: [] as Like[] });
      })
    );
  }

  getCommentsByPostId(postId: number, url?: string | null): Observable<PaginatedResponse<Comment>>{
    const requestUrl = url || `${this.apiUrl}/post/${postId}/comments/`;
    return this.http.get<PaginatedResponse<Comment>>(requestUrl).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al obtener comentarios para el post ${postId}:`, err.message);
        return of({ start_page: 0, count: 0, next: null, previous: null, results: [] as Comment[] });
      })
    );
  }

  likePost(postId: number): Observable<any> { 
    return this.http.post(`${this.apiUrl}/post/${postId}/likes/`, {}).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al dar like al post ${postId}:`, err.message);
        return throwError(() => err);
      })
    );
  }

  unlikePost(postId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/post/${postId}/unlikes/`).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al quitar like del post ${postId}:`, err.message);
        return throwError(() => err);
      })
    );
  }

  deletePost(postId: number): Observable<any> { 
    return this.http.delete(`${this.apiUrl}/post/${postId}/`).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al eliminar el post ${postId}:`, err.message);
        return throwError(() => err);
      })
    );
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
        console.error(`Error al obtener el post ${postId}:`, err.message);
        this.resetPost();
        return throwError(() => err);
      })
    ).subscribe({
      next: (response) => this.detailedPost.set(response),
      error: (err: HttpErrorResponse) => console.error('Error en fetchPost:', err)
    });
  }

  addComment(postId: number, data: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/post/${postId}/comments/`, {'content': data}).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al agregar un comentario al post ${postId}:`, err.message);
        return throwError(() => err);
      })
    );
  }

  addPost(): void {
    this.http.post<Post>(`${this.apiUrl}/post/`, this.detailedPost()).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error al agregar el post:', err.message);
        return throwError(() => err);
      })
    ).subscribe({
      next: () => {
        this.getPosts();
      },
      error: (err: HttpErrorResponse) => console.error('Error en addPost:', err)
    });
  }

  editPost(post: Post): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/post/${post.id}/`, post).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al editar el post ${post.id}:`, err.message);
        return throwError(() => err);
      })
    );
  }

}
