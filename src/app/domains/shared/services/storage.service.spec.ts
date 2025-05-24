/* 
This file is just for testing the  creation, it is not posibble to really test this service
 because it is a wrapper for the local storage and session storage
 and it is not possible to mock the local storage and session storage in a test environment
*/

import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';


describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
