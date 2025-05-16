import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from 'src/app/environments/environment';
import { StorageService } from './storage.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [ provideHttpClient() ]});
    service = TestBed.inject(AuthService);  
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

describe('Register function testing', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [ provideHttpClient(), provideHttpClientTesting() ]});
    service = TestBed.inject(AuthService);  
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  }); 

  it('should register successfully', () => {
    const mockUser = {
      username: 'testuser',
      password: 'testpassword'
    };
    const mockSuccesResponse = {
      status: 201,
      message: 'User created successfully'
    };
    service.register(mockUser.username, mockUser.password).subscribe( response => {
      expect(response).toBeTruthy();
      expect(response.status).toEqual(201);
      expect(response.message).toEqual('User created successfully');
    }); 
    const req = httpMock.expectOne(`${environment.apiUrl}/register/`);
    expect(req.request.method).toBe('POST');
    req.flush(mockSuccesResponse);
  });

  it('should fail to register with existing username', () => {
    const mockUser = {
      username: 'existinguser',
      password: 'testpassword'
    };
    const mockErrorResponse = {
      status: 400,
      message: 'an account with that email already exists'
    };
    service.register(mockUser.username, mockUser.password).subscribe( response => {
      expect(response).toBeFalsy();
      expect(response.status).toEqual(400);
      expect(response.message).toEqual('an account with that email already exists');
    }, error => {
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/register/`);
    expect(req.request.method).toBe('POST');
    req.flush(mockErrorResponse, { status: 400, statusText: 'Bad Request' });
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

  afterEach(() => {
    httpMock.verify();
  });

  it('should login successfully', () => {
    const mockUser = {
      username: 'testuser',
      password: 'testpassword'
    };
    const mockSuccesResponse = {
      message: 'Login successful'
    };
    service.login(mockUser.username, mockUser.password).subscribe( response => {
      expect(response).toBeTruthy();
    }); 
    const req = httpMock.expectOne(`${environment.apiUrl}/token/`);
    expect(req.request.method).toBe('POST');
    req.flush(mockSuccesResponse);
  });
 
  it('should fail to login with invalid credentials and propagate the error correctly', () => {
    const mockUser = {
      username: 'invaliduser',
      password: 'invalidpassword'
    };
  
    const expectedErrorBody = {
      message: 'Invalid credentials'
    };
  
    service.login(mockUser.username, mockUser.password)
      .subscribe({
        error: (error: HttpErrorResponse) => {
          expect(error).toBeInstanceOf(HttpErrorResponse);
          expect(error.status).toBe(401);
          expect(error.error).toEqual(jasmine.objectContaining(expectedErrorBody));
        }
      });
  
    const targetUrl = `${environment.apiUrl}/token/`;
    const req = httpMock.expectOne(targetUrl);
  
    expect(req.request.method).toBe('POST');
  
    expect(req.request.body).toEqual({ username: mockUser.username, password: mockUser.password });
  
    req.flush(expectedErrorBody, { status: 401, statusText: 'Unauthorized' });
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

  afterEach(() => {
    httpMock.verify();
  });

  it('should logout successfully', () => {
    const mockUser = {
      username: 'testuser',
      password: 'testpassword'
    };
    const mockSuccesResponse = {
      message: 'Logout successful'
    };
    service.logout(); 
    const req = httpMock.expectOne(`${environment.apiUrl}/logout/`);
    expect(req.request.method).toBe('POST');
    req.flush(mockSuccesResponse);
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
    service.refreshToken().subscribe( response => {
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
    const mockUser = {
      username: 'testuser',
      password: 'testpassword'
    };
    const mockSuccesResponse = {
      username: 'testuser',
    };
    const dummyToken = 'dummyAccessToken';

    spyOn(service, 'getAccessToken').and.returnValue(dummyToken);
    

    service.getProfile().subscribe( response => {
      expect(response).toBeTruthy();
      expect(response).toEqual(mockSuccesResponse.username);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/profile/`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${dummyToken}`);
    req.flush(mockSuccesResponse);
    expect(service.profile()).toEqual(mockSuccesResponse.username);
  });
})
