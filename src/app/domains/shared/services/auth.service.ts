import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/app/environments/environment';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private storageService = inject(StorageService);
  private apiUrl = environment.apiUrl;

  profile = signal<string | null>(null);
  isLoggedIn = signal<boolean>(false);

  private readonly ACCES_TOKEN_KEY = 'miAppAccessToken';
  private readonly REFRESH_TOKEN_KEY = 'miAppRefreshToken';

  private saveTokens(accessToken: string, refreshToken: string) {
    this.storageService.setItem(this.ACCES_TOKEN_KEY, accessToken);
    this.storageService.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }
  private saveAccessToken(accessToken: string) {
    this.storageService.setItem(this.ACCES_TOKEN_KEY, accessToken);
  }

  getAccessToken(): string | null {
    return this.storageService.getItem(this.ACCES_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return this.storageService.getItem(this.REFRESH_TOKEN_KEY);
  }

  private clearTokens(): void {
    this.storageService.removeItem(this.ACCES_TOKEN_KEY);
    this.storageService.removeItem(this.REFRESH_TOKEN_KEY);
  }

  getProfile(): Observable<string | null> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      return of(null);
    }
    return this.http.get<{ username: string }>(`${this.apiUrl}/profile/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).pipe(
      map((response) => response.username),
      tap((username) => {
        this.profile.set(username);
      })
    );

  }
  login(username: string, password: string): Observable<{ access: string, refresh: string }> {
    return this.http.post<{ access: string, refresh: string }>(`${this.apiUrl}/token/`, { username: username, password: password }).pipe(
      tap((response) => {
        this.saveTokens(response.access, response.refresh);
      }),
      catchError((err: HttpErrorResponse) => {
        this.clearTokens();
        return throwError(() => err);
      })
    );
  }

  register(username: string, password: string): Observable<{ message: string, status: number }> {
    return this.http.post<{ message: string, status: number }>(`${this.apiUrl}/register/`, { username: username, password: password });
  }

  logout() {
    this.http.post(`${this.apiUrl}/logout/`, {
      refresh: this.getRefreshToken(),
      headers: { Authorization: `Bearer ${this.getAccessToken()}` } 
    }).subscribe()
    this.isLoggedIn.set(false);
    this.clearTokens();
  }

  refreshToken(): Observable<string | null> {
    {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        this.clearTokens();
        return of(null);
      }
      return this.http.post<{ access: string }>(`${this.apiUrl}/token/refresh/`, { refresh: refreshToken }).pipe(
        map((response) => {
          this.saveAccessToken(response.access);
          return response.access;
        }), catchError((err: HttpErrorResponse) => {
          this.clearTokens();
          return of(null);
        })
      );
    }
  }
}