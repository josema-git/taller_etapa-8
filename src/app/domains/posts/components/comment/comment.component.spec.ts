import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePipe }                   from '@angular/common';
import { By }                        from '@angular/platform-browser';

import { CommentComponent }          from './comment.component';
import { Comment }                   from '@/shared/models/post';

describe('CommentComponent', () => {
  let fixture:   ComponentFixture<CommentComponent>;
  let component: CommentComponent;
  let datePipe:  DatePipe;

  const sampleComment: Comment = {
    id: 1,
    post: 1,
    author: 'Jane Doe',
    created_at: '2025-05-20T14:30:00Z',
    content: 'This is a sample comment!',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentComponent],
      providers: [DatePipe],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentComponent);
    fixture.componentRef.setInput('comment', sampleComment);
    fixture.detectChanges();

    component = fixture.componentInstance;
    datePipe  = TestBed.inject(DatePipe);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the author name', () => {
    const el = fixture.debugElement.query(By.css('#comment-author')).nativeElement as HTMLElement;
    expect(el.textContent).toContain(sampleComment.author);
  });

  it('should render the created_at formatted by DatePipe', () => {
    const el = fixture.debugElement.query(By.css('#comment-date')).nativeElement as HTMLElement;
    const expected = datePipe.transform(sampleComment.created_at, 'M/d/yy h:mm');
    expect(el.textContent).toContain(expected!);
  });
});
