import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClient, HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from 'src/app/environments/environment';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

describe('Register function testing', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let storageServiceMock: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    storageServiceMock = jasmine.createSpyObj('StorageService', ['getItem', 'setItem', 'removeItem']);
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AuthService, { provide: StorageService, useValue: storageServiceMock }]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should register successfully', () => {
    const mockUser = {
      username: 'testuser@test.com',
      password: 'testpassword'
    };
    const mockResponse = {
      message: 'User created succesfully'
    };
    service.register(mockUser).subscribe(
      (response) => {
        expect(response).toBeTruthy();
        expect(response.message).toEqual('User created succesfully');
      },
      (error: HttpErrorResponse) => {
        fail('Expected successful registration, but got error: ' + error.message);
      }
    );
    const req = httpMock.expectOne(`${environment.apiUrl}/register/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockUser);
    req.flush(mockResponse);
  });

  it('should fail to register with existing username', () => {
    const mockUser = {
      username: 'testuser@test.com',
      password: 'testpassword'
    };
    const mockErrorResponse = {
      message: 'an account with that email already exists',
      status: 400,
      detail: 'Email already exists'
    };
    service.register(mockUser).subscribe({
      error: (error: HttpErrorResponse) => {
        expect(error).toBeInstanceOf(HttpErrorResponse);
        expect(error.status).toBe(400);
        expect(error.error.message).toEqual('an account with that email already exists');
      }
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/register/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockUser);
    req.flush(mockErrorResponse);
  });
})
describe('Login function testing', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let storageServiceMock: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    storageServiceMock = jasmine.createSpyObj('StorageService', ['getItem', 'setItem', 'removeItem']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: StorageService, useValue: storageServiceMock }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should login successfully and store tokens', () => {
    const mockUser = {
      username: 'testuser@test.com',
      password: 'testpassword'
    };
    const mockResponse = {
      access: 'AccessToken',
      refresh: 'RefreshToken'
    };
    service.login(mockUser).subscribe(
      (response) => {
        expect(response).toBeTruthy();
        expect(response.access).toBeDefined();
        expect(response.refresh).toBeDefined();
      }, (error: HttpErrorResponse) => {
        fail('Expected successful login, but got error: ' + error.message);
      }
    );
    const req = httpMock.expectOne(`${environment.apiUrl}/token/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockUser);
    req.flush(mockResponse);
    httpMock.verify();
    expect(storageServiceMock.setItem).toHaveBeenCalledWith('miAppAccessToken', mockResponse.access);
    expect(storageServiceMock.setItem).toHaveBeenCalledWith('miAppRefreshToken', mockResponse.refresh);
  });

  it('should fail to login with invalid credentials and propagate the error correctly', () => {
    const mockUser = {
      username: 'invaliduser',
      password: 'invalidpassword'
    };
    const mockErrorResponse = {
      message: 'Invalid credentials',
      status: 401,
      detail: 'No active account found with the given credentials'
    };
    service.login(mockUser)
      .subscribe({
        error: (error: HttpErrorResponse) => {
          expect(error).toBeInstanceOf(HttpErrorResponse);
          expect(error.status).toBe(401);
          expect(error.error.detail).toEqual('No active account found with the given credentials');
        }
      });
  })
})

describe('Logout function testing', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let storageServiceMock: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    storageServiceMock = jasmine.createSpyObj('StorageService', ['getItem', 'setItem', 'removeItem']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: StorageService, useValue: storageServiceMock }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should logout successfully', () => {
    const mockUser = {
      username: 'testuser@test.com',
      password: 'testpassword'
    };
    const mockResponse = {
      message: 'Logout successful',
    };
    service.logout().subscribe(
      (response) => {
        expect(response).toBeTruthy();
        expect(response.message).toEqual('Logout successful');
      }
    );

    const req = httpMock.expectOne(`${environment.apiUrl}/logout/`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

})

describe('Refresh Token function testing', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let storageServiceMock: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    storageServiceMock = jasmine.createSpyObj('StorageService', ['getItem', 'setItem', 'removeItem']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: StorageService, useValue: storageServiceMock }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should refresh token successfully', () => {
    const mockUser = {
      username: 'testuser',
      password: 'testpassword'
    };
    const mockSuccesResponse = {
      access: 'newAccessToken',
      refresh: 'newRefreshToken'
    };
    const dummyToken = 'dummyRefreshToken';
    spyOn(service, 'getRefreshToken').and.returnValue(dummyToken);
    service.refreshToken().subscribe(response => {
      expect(response).toBeTruthy();
      expect(response).toEqual('newAccessToken');
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/token/refresh/`);
    expect(req.request.method).toBe('POST');
    req.flush(mockSuccesResponse);
  });
})

describe('Get Profile function testing', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let storageServiceMock: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    storageServiceMock = jasmine.createSpyObj('StorageService', ['getItem', 'setItem', 'removeItem']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: StorageService, useValue: storageServiceMock }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get profile successfully', () => {
    const mockSuccesResponse = {
      username: 'testuser',
    };
    const dummyToken = 'dummyAccessToken';

    spyOn(service, 'getAccessToken').and.returnValue(dummyToken);

    service.getProfile().subscribe(response => {
      expect(response).toBeTruthy();
      expect(response).toEqual(mockSuccesResponse.username);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/profile/`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSuccesResponse);
    expect(storageServiceMock.getItem).toHaveBeenCalledWith('miAppAccessToken');
    expect(service.profile()).toEqual(mockSuccesResponse.username);
    expect(service.isLoggedIn()).toEqual(true);
  });
});