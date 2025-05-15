import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const interceptorsInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  let authReq = req;


  if (req.url.includes('token/refresh/')) {
    const refreshToken = authService.getRefreshToken();
    if (refreshToken) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${refreshToken}`
        }
      });
    } else{
      authService.LocalLogout();
    }
  } else {
    const accessToken = authService.getAccessToken();
    if (accessToken) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    }
  }

return next(authReq).pipe(
  catchError((err : HttpErrorResponse) => {
    if (err.status === 401) {
      if (req.url.includes('token/refresh/')) {
        authService.LocalLogout();
      } else {
        return authService.refreshToken().pipe(
          switchMap((newAccessToken : string | null) => {
            if (newAccessToken){
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newAccessToken}`
                }
              });
              return next(newReq);
            } else {
              authService.LocalLogout();
              return next(req);
            }
          }), catchError((refreshError) => {
            authService.LocalLogout();
            return next(req);
          })
        );
      }
    }
    throw throwError(() => err);
  })
)
};
