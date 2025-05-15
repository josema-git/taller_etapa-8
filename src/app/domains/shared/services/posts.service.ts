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

  postsResponse = signal<PaginatedResponse<Post>>(
    {
      start_page: 0,
      count: 0,
      next: null,
      previous: null,
      results: []
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

  editPost(postId: number, data: FormData): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/post/${postId}/`, data).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al editar el post ${postId}:`, err.message);
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

  getPost(postId: number, url?: string): Observable<Post> {
    const requestUrl = url || `${this.apiUrl}/post/${postId}/`;
    return this.http.get<Post>(requestUrl).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al obtener el post ${postId}:`, err.message);
        return throwError(() => err);
      })
    );
  }

  addComment(postId: number, data: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/post/${postId}/comments/`, {'content': data}).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al agregar un comentario al post ${postId}:`, err.message);
        return throwError(() => err);
      })
    );
  }

}
