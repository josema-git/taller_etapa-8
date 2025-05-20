import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/app/environments/environment';
import { catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private storageService = inject(StorageService);
  private apiUrl = environment.apiUrl;
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  profile = signal<string | null>(null);
  isLoggedIn = signal<boolean>(false);

  private readonly ACCESS_TOKEN_KEY = 'miAppAccessToken';
  private readonly REFRESH_TOKEN_KEY = 'miAppRefreshToken';

  checkInitialState() {
    const accessToken = this.getAccessToken();
    if (accessToken) {
      this.getProfile().subscribe()
    } else {
      this.LocalLogout();
    }
  }

  LocalLogout() {
    this.isLoggedIn.set(false);
    this.profile.set(null);
    this.clearTokens();
  }

  private saveTokens(accessToken: string, refreshToken: string) {
    this.storageService.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    this.storageService.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }
  private saveAccessToken(accessToken: string) {
    this.storageService.setItem(this.ACCESS_TOKEN_KEY, accessToken);
  }

  getAccessToken(): string | null {
    return this.storageService.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return this.storageService.getItem(this.REFRESH_TOKEN_KEY);
  }

  private clearTokens(): void {
    this.storageService.removeItem(this.ACCESS_TOKEN_KEY);
    this.storageService.removeItem(this.REFRESH_TOKEN_KEY);
  }

  getProfile(): Observable<string | null> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      return of(null);
    }
    return this.http.get<{ username: string }>(`${this.apiUrl}/profile/`).pipe(
      map((response) => response.username),
      tap((username) => {
        this.profile.set(username);
        this.isLoggedIn.set(true);
      }),
      catchError((err) => {
        this.LocalLogout();
        return of(null);
      })
    );
  }

  login(credentials: { username: string, password: string }): Observable<{ access: string, refresh: string }> {
    return this.http.post<{ access: string, refresh: string }>(`${this.apiUrl}/token/`, credentials).pipe(
      tap((response) => {
        this.saveTokens(response.access, response.refresh);
        this.getProfile().subscribe();
      }),
      map((response) => response),
      catchError((err: HttpErrorResponse) => {
        this.LocalLogout();
        return throwError(() => err);
      })
    );
  }

  register(credentials: { username: string, password: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/register/`, credentials);
  }

  logout(): Observable<{ 'message': string }> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<{ 'message': string }>(`${this.apiUrl}/logout/`, { refresh: refreshToken }).pipe(
      tap(() => {
        this.LocalLogout();
        this.success.set('Logout successful');
      }),
      catchError((err: HttpErrorResponse) => {
        this.LocalLogout();
        this.error.set('Logout failed');
        return throwError(() => err);
      })
    )
  }

  refreshToken(): Observable<string | null> {
    {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        this.LocalLogout();
        return of(null);
      }
      return this.http.post<{ access: string }>(`${this.apiUrl}/token/refresh/`, { refresh: refreshToken }).pipe(
        map((response) => {
          this.saveAccessToken(response.access);
          this.isLoggedIn.set(true);
          return response.access;
        }), catchError((err: HttpErrorResponse) => {
          this.LocalLogout();
          return of(null);
        })
      );
    }
  }
}