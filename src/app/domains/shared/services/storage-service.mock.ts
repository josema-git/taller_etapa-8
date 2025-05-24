export function createStorageServiceMock(): jasmine.SpyObj<any>  {

  const fakeStorage: { [key: string]: string } = {};
  
  const storageServiceMock = jasmine.createSpyObj('StorageService', ['getItem', 'setItem', 'removeItem']);

  storageServiceMock.setItem.and.callFake((key: string, value: string) => {
    fakeStorage[key] = value;
  });

  storageServiceMock.getItem.and.callFake((key: string) => {
    return fakeStorage[key] || null;
  });

  storageServiceMock.removeItem.and.callFake((key: string) => {
    delete fakeStorage[key];
  });

  return storageServiceMock;
}
