import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from 'src/app/environments/environment';
import { AuthService } from './auth.service';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Post, Like, PaginatedResponse } from '../models/post';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export default class PostsService {
  http = inject(HttpClient);
  authService = inject(AuthService);
  apiUrl = environment.apiUrl;

  postsResponse = signal<PaginatedResponse<Post>>(
    {
      current_page: 1,
      total_count: 0,
      total_pages: 0,
      count: 0,
      next: null,
      previous: null,
      results: []
    }
  );

  fillPosts(url?: string) {
    this.getPosts().subscribe({
      next: (response) => {
        this.postsResponse.set(response);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  getPosts(url: string = `${this.apiUrl}/post/`): Observable<PaginatedResponse<Post>> {
    const initialAccessToken = this.authService.getAccessToken();
    if (!initialAccessToken) {
      this.authService.isLoggedIn.set(false);
      return this.http.get<PaginatedResponse<Post>>(url);
    } else {
      this.authService.isLoggedIn.set(true);
      return this.http.get<PaginatedResponse<Post>>(url, {
        headers: {
          Authorization: `Bearer ${initialAccessToken}`
        }
      }).pipe(catchError((error: HttpErrorResponse) => {
        return this.authService.refreshToken().pipe(switchMap((newaccestoken) => {
          if (!newaccestoken) {
            this.authService.isLoggedIn.set(false);
            return this.http.get<PaginatedResponse<Post>>(url);
          }
          this.authService.isLoggedIn.set(true);
          return this.http.get<PaginatedResponse<Post>>(url, {
            headers: {
              Authorization: `Bearer ${this.authService.getAccessToken()}`
            }
          })
        }))
      }));
    }
  }

  getLikesByPostId(id: number, url: string = `${this.apiUrl}/post/${id}/likes/`): Observable<PaginatedResponse<Like>> {
    return this.http.get<PaginatedResponse<Like>>(url, {
      headers: {
        Authorization: `Bearer ${this.authService.getAccessToken()}`
      }
    }).pipe(
      map((response) => {
        return response;
      }),
      catchError((err: HttpErrorResponse) => {
        console.error(err);
        return [];
      }))
    }

  likePost(id: number) {
    return this.http.post(`${this.apiUrl}/post/${id}/likes/`,{} ,{
      headers: {
        Authorization: `Bearer ${this.authService.getAccessToken()}`
      }});
  }

  unlikePost(id: number) {
    return this.http.delete(`${this.apiUrl}/post/${id}/unlikes/`, {
      headers: {
        Authorization: `Bearer ${this.authService.getAccessToken()}`
      }});
  }

  getPost(id: number) {
    if (this.authService.getRefreshToken()) {
      this.authService.refreshToken()
    }
    return this.http.get(`${this.apiUrl}/post/${id}/`);
  }


}
