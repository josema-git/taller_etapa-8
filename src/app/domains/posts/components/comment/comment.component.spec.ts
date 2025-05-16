import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentComponent } from './comment.component';

describe('CommentComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;
  const mockComment = {
    id: 1,
    author: 'testuser',
      post: 1,
      content: 'This is a test comment',
      created_at: new Date('2023-10-01T12:00:00Z'),
    };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentComponent]
    })
      .compileComponents();


    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    
    fixture.componentRef.setInput('comment', mockComment);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
