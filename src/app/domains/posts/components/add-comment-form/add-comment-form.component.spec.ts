import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCommentFormComponent } from './add-comment-form.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('AddCommentFormComponent', () => {
  let component: AddCommentFormComponent;
  let fixture: ComponentFixture<AddCommentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
      imports: [AddCommentFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCommentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
