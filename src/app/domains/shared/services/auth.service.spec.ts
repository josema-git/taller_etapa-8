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

describe('Register should register succesfully', () => {
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
      }, (error: HttpErrorResponse) => {
        fail('Expected successful registration, but got error: ' + error.message);
      }
    );
    const req = httpMock.expectOne(`${environment.apiUrl}/register/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockUser);
    req.flush(mockResponse);
  });
})

describe('Register should fail to register', () => {
  let service: AuthService;
  let httpClient: HttpClient;
  let storageServiceMock: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    storageServiceMock = jasmine.createSpyObj('StorageService', ['getItem', 'setItem', 'removeItem']);
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), AuthService, { provide: StorageService, useValue: storageServiceMock }]
    });
    service = TestBed.inject(AuthService);
    httpClient = TestBed.inject(HttpClient);
  });

  it('should fail to register', (done) => {
    const mockUser = {
      username: '',
      password: ''
    };

    const mockExpectedErrorResponse = {
      message: 'Username and password are required'
    };

    service.register(mockUser).subscribe({
      error: (error: HttpErrorResponse) => {
        expect(error).toBeInstanceOf(HttpErrorResponse);
        expect(error.status).toBe(400);
        expect(error.error.message).toEqual('username and password are required');
        done();
      }
    });
  });

  it('should fail to register for duplicated email', (done) => {
    const mockUser = {
      username: 'user@test.com',
      password: 'testpassword'
    };
    const mockExpectedErrorResponse = {
      message: 'an account with that email already exists'
    };
    service.register(mockUser).subscribe({
      error: (error: HttpErrorResponse) => {
        expect(error).toBeInstanceOf(HttpErrorResponse);
        expect(error.status).toBe(400);
        expect(error.error.message).toEqual('an account with that email already exists');
        done();
      }
    });
  });
})

describe('Login function testing', () => {
  let service: AuthService;
  let httpClient: HttpClient;
  let storageServiceMock: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    storageServiceMock = jasmine.createSpyObj('StorageService', ['getItem', 'setItem', 'removeItem']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        { provide: StorageService, useValue: storageServiceMock }
      ]
    });
    service = TestBed.inject(AuthService);
    httpClient = TestBed.inject(HttpClient);
  });

  it('should login successfully and store tokens', (done) => {
    const mockUser = {
      username: 'user@test.com',
      password: 'testpassword'
    };
    service.login(mockUser).subscribe(
      (response) => {
        expect(response).toBeTruthy();
        expect(response.access).toBeDefined();
        expect(response.refresh).toBeDefined();
        expect(storageServiceMock.setItem).toHaveBeenCalled();
        expect(storageServiceMock.setItem).toHaveBeenCalled();
        done();
      }, (error: HttpErrorResponse) => {
        console.error('ERROR:', error);
        fail('Expected successful login, but got error: ' + error.message);
        done();
      }
    );
  });

  it('should fail to login with invalid credentials and propagate the error correctly', (done) => {
    const mockUser = {
      username: 'invaliduser',
      password: 'invalidpassword'
    };
    service.login(mockUser)
      .subscribe({
        error: (error: HttpErrorResponse) => {
          expect(error).toBeInstanceOf(HttpErrorResponse);
          expect(error.status).toBe(401);
          expect(error.error.detail).toEqual('No active account found with the given credentials');
          done();
        },
      });
  })
})

fdescribe('Logout function testing', () => {
  let service: AuthService;
  let httpClient: HttpClient;
  let storageServiceMock: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    storageServiceMock = jasmine.createSpyObj('StorageService', ['getItem', 'setItem', 'removeItem']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        { provide: StorageService, useValue: storageServiceMock }
      ]
    });
    service = TestBed.inject(AuthService);
    httpClient = TestBed.inject(HttpClient);
  });

  it('should logout successfully', (done) => {
    const mockUser = {
      username: 'user@test.com',
      password: 'testpassword'
    };
    service.login(mockUser).subscribe(
      (response) => {
        expect(response).toBeTruthy();
        expect(response.access).toBeDefined();
        expect(response.refresh).toBeDefined();
        service.logout().subscribe(
          (logoutResponse) => {
            expect(logoutResponse).toBeTruthy();
            expect(logoutResponse.message).toEqual('Logout successful');
            expect(storageServiceMock.removeItem).toHaveBeenCalledWith('miAppAccessToken');
            expect(storageServiceMock.removeItem).toHaveBeenCalledWith('miAppRefreshToken');
            done();
          }, (error: HttpErrorResponse) => {
            console.error('ERROR:', error);
            fail('Expected successful logout, but got error: ' + error.message);
            done();
          }
        );
      }
    );
})
})


// describe('Refresh Token function testing', () => {
//   let service: AuthService;
//   let httpClient: HttpClient;
//   let storageServiceMock: jasmine.SpyObj<StorageService>;

//   beforeEach(() => {
//     storageServiceMock = jasmine.createSpyObj('StorageService', ['getItem', 'setItem', 'removeItem']);

//     TestBed.configureTestingModule({
//       providers: [
//         AuthService,
//         provideHttpClient(),
//         provideHttpClientTesting(),
//         { provide: StorageService, useValue: storageServiceMock }
//       ]
//     });
//     service = TestBed.inject(AuthService);
//     httpMock = TestBed.inject(HttpClient);
//   });

//   afterEach(() => {
//     httpMock.verify();
//   });

//   it('should refresh token successfully', () => {
//     const mockUser = {
//       username: 'testuser',
//       password: 'testpassword'
//     };
//     const mockSuccesResponse = {
//       access: 'newAccessToken',
//       refresh: 'newRefreshToken'
//     };
//     const dummyToken = 'dummyRefreshToken';
//     spyOn(service, 'getRefreshToken').and.returnValue(dummyToken);
//     service.refreshToken().subscribe(response => {
//       expect(response).toBeTruthy();
//       expect(response).toEqual('newAccessToken');
//     });
//     const req = httpMock.expectOne(`${environment.apiUrl}/token/refresh/`);
//     expect(req.request.method).toBe('POST');
//     req.flush(mockSuccesResponse);
//   });
// })

// describe('Get Profile function testing', () => {
//   let service: AuthService;
//   let httpClient: HttpClient;
//   let storageServiceMock: jasmine.SpyObj<StorageService>;

//   beforeEach(() => {
//     storageServiceMock = jasmine.createSpyObj('StorageService', ['getItem', 'setItem', 'removeItem']);

//     TestBed.configureTestingModule({
//       providers: [
//         AuthService,
//         provideHttpClient(),
//         provideHttpClientTesting(),
//         { provide: StorageService, useValue: storageServiceMock }
//       ]
//     });
//     service = TestBed.inject(AuthService);
//     httpMock = TestBed.inject(HttpClient);
//   });

//   afterEach(() => {
//     httpMock.verify();
//   });

//   it('should get profile successfully', () => {
//     const mockSuccesResponse = {
//       username: 'testuser',
//     };
//     const dummyToken = 'dummyAccessToken';

//     spyOn(service, 'getAccessToken');

//     storageServiceMock.setItem('miAppAccessToken', dummyToken);

//     service.getProfile().subscribe(response => {
//       expect(response).toBeTruthy();
//       expect(response).toEqual(mockSuccesResponse.username);
//       expect(service.profile()).toEqual(mockSuccesResponse.username);
//       expect(service.isLoggedIn()).toEqual(true);
//     });
//     const req = httpMock.expectOne(`${environment.apiUrl}/profile/`);
//     expect(req.request.method).toBe('GET');
//     req.flush(mockSuccesResponse);
//     expect(service.getAccessToken).toHaveBeenCalled();
//     expect(storageServiceMock.getItem).toHaveBeenCalled();

//   });
// });