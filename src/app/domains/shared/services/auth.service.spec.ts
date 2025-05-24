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
import { lastValueFrom } from 'rxjs';

import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { createStorageServiceMock } from './storage-service.mock';
import { interceptorsInterceptor } from '../interceptors.interceptor';
import { environment } from 'src/app/environments/environment';

const REGISTER_URL = `${environment.apiUrl}/register/`;
const testCreds = { username: 'user@test.com', password: 'testpassword' };

describe('AuthService register', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let storageMock: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    storageMock = createStorageServiceMock();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
        { provide: StorageService, useValue: storageMock }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should register successfully', () => {
    const mockResponse = { message: 'User created successfully' };
    const call = lastValueFrom(service.register(testCreds));

    const req = httpMock.expectOne(REGISTER_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(testCreds);
    req.flush(mockResponse);

    return expectAsync(call).toBeResolvedTo(mockResponse);
  });

  it('should propagate registration error', () => {
    const errorBody = { message: 'Invalid data' };
    const call = lastValueFrom(service.register({ username: '', password: '' }));

    const req = httpMock.expectOne(REGISTER_URL);
    req.flush(errorBody, { status: 400, statusText: 'Bad Request' });

    return expectAsync(call).toBeRejectedWith(jasmine.objectContaining({ status: 400 }));
  });
});

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpClient;
  let storageMock: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    storageMock = createStorageServiceMock();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([interceptorsInterceptor])),
        AuthService,
        { provide: StorageService, useValue: storageMock }
      ]
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpClient);
  });

  it('should login successfully and store tokens', async () => {
    const response = await lastValueFrom(service.login(testCreds));
    expect(response.access).toBeDefined();
    expect(response.refresh).toBeDefined();
    expect(storageMock.setItem).toHaveBeenCalledWith('miAppAccessToken', response.access);
    expect(storageMock.setItem).toHaveBeenCalledWith('miAppRefreshToken', response.refresh);
    expect(service.getAccessToken()).toBe(response.access);
    expect(service.getRefreshToken()).toBe(response.refresh);
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('should logout successfully', async () => {
    const loginResp = await lastValueFrom(service.login(testCreds));
    expect(service.isLoggedIn()).toBeTrue();

    const logoutResp = await lastValueFrom(service.logout());
    expect(logoutResp.message).toBe('Logout successful');
    expect(storageMock.removeItem).toHaveBeenCalledWith('miAppAccessToken');
    expect(storageMock.removeItem).toHaveBeenCalledWith('miAppRefreshToken');
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should fail to logout when not logged in', async () => {
    try {
      await lastValueFrom(service.logout());
      fail('Expected logout to fail');
    } catch (err: any) {
      expect(err.status).toBe(401);
      expect(service.isLoggedIn()).toBeFalse();
    }
  });

  it('should refresh token successfully', async () => {
    const loginResp = await lastValueFrom(service.login(testCreds));
    const oldAccess = loginResp.access;

    const refreshResp = await lastValueFrom(service.refreshToken());
    expect(refreshResp.access).toBeDefined();
    expect(refreshResp.access).not.toBe(oldAccess);
    expect(storageMock.setItem).toHaveBeenCalledWith('miAppAccessToken', refreshResp.access);
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('should fail to refresh if no refresh token', async () => {
    try {
      await lastValueFrom(service.refreshToken());
      fail('Expected refreshToken to throw');
    } catch (err: any) {
      expect(service.isLoggedIn()).toBeFalse();
    }
  });

  it('should get profile when logged in', async () => {
    const loginResp = await lastValueFrom(service.login(testCreds));
    const profileResp = await lastValueFrom(service.getProfile());
    expect(profileResp.username).toBe(testCreds.username);
    expect(service.profile()).toBe(testCreds.username);
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('should fail to get profile when not logged in', async () => {
    try {
      await lastValueFrom(service.getProfile());
      fail('Expected getProfile to throw');
    } catch (err: any) {
      expect(err.status).toBe(401);
      expect(service.isLoggedIn()).toBeFalse();
    }
  });
});
