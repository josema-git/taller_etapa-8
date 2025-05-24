import { TestBed } from '@angular/core/testing';
import {
  provideHttpClient,
  withInterceptors,
  HttpClient
} from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController
} from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { interceptorsInterceptor } from './interceptors.interceptor';
import { AuthService } from './services/auth.service';

describe('interceptorsInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authSpy: jasmine.SpyObj<AuthService>;

  const TEST_URL    = '/data';
  const REFRESH_URL = '/token/refresh/';

  beforeEach(() => {
    // spy for AuthService
    authSpy = jasmine.createSpyObj('AuthService', [
      'getAccessToken',
      'getRefreshToken',
      'refreshToken',
      'LocalLogout'
    ]);

    // TestBed with standalone HTTP + testing + interceptor
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([interceptorsInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authSpy }
      ]
    });

    http     = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  // verify that no requests are left
  afterEach(() => httpMock.verify());


  it('should add Authorization header with access token', () => {
    // Mock the access token
    authSpy.getAccessToken.and.returnValue('ACCESS123');

    // Make a request to the test URL
    http.get(TEST_URL).subscribe();
    // Expect the request to be sent to the test URL
    const req = httpMock.expectOne(TEST_URL);
    // Check that the Authorization header was correctly set by the interceptor
    expect(req.request.headers.get('Authorization')).toBe('Bearer ACCESS123');
    req.flush({});
  });


  it('should add Authorization header with refresh token on refresh URL', () => {
    authSpy.getRefreshToken.and.returnValue('REFRESH456');

    // now we try whith the refresh url
    http.get(REFRESH_URL).subscribe();
    const req = httpMock.expectOne(REFRESH_URL);

    // and expect the refresh token to be in the headers 
    expect(req.request.headers.get('Authorization')).toBe('Bearer REFRESH456');
    req.flush({});
  });


  it('should call refreshToken and retry original request on 401', () => {
    // Mock the access token and refresh token for token refreshing test
    authSpy.getAccessToken.and.returnValue('OLD_TOKEN');
    authSpy.refreshToken.and.returnValue(of({ access: 'NEW_TOKEN' }));

    http.get(TEST_URL).subscribe();

    // 1st attempt with old token will fail and try to refresh the access token
    const req1 = httpMock.expectOne(TEST_URL);
    expect(req1.request.headers.get('Authorization')).toBe('Bearer OLD_TOKEN');
    req1.flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(authSpy.refreshToken).toHaveBeenCalled();

    // 2nd attempt with new token should succeed with the new access token
    const req2 = httpMock.expectOne(TEST_URL);
    expect(req2.request.headers.get('Authorization')).toBe('Bearer NEW_TOKEN');
    req2.flush({}); 
  });


  it('should call LocalLogout if refreshToken errors', () => {
    authSpy.getAccessToken.and.returnValue('OLD_TOKEN');
    authSpy.refreshToken.and.returnValue(throwError(() => new Error('refresh-fail')));

    http.get(TEST_URL).subscribe({
      error: () => {
        expect(authSpy.LocalLogout).toHaveBeenCalled();
      }
    });

    // first attempt fails with 401 so we try to refresh the token
    const req1 = httpMock.expectOne(TEST_URL);
    req1.flush({}, { status: 401, statusText: 'Unauthorized' });

    // then the refresh token fails, we call LocalLogout and retry the original request
    expect(authSpy.LocalLogout).toHaveBeenCalled();
    const req2 = httpMock.expectOne(TEST_URL);
    req2.flush({}, { status: 401, statusText: 'Unauthorized' });
  });
});
