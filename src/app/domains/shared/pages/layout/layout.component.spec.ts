import { ComponentFixture, TestBed } from '@angular/core/testing';

import  LayoutComponent  from './layout.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

class router{
  navigate = jasmine.createSpy('navigate');
}

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;
  let mockRouter: router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([])],
      imports: [LayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
