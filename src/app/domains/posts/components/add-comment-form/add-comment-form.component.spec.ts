import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule }        from '@angular/forms';
import { By }                        from '@angular/platform-browser';
import { of }                        from 'rxjs';
import { AddCommentFormComponent }   from './add-comment-form.component';
import { PostsService }              from '@/shared/services/posts.service';

describe('AddCommentFormComponent', () => {
  let fixture:   ComponentFixture<AddCommentFormComponent>;
  let component: AddCommentFormComponent;
  let postsService: {
    addComment: jasmine.Spy;
    detailedPost: () => { id: number };
  };

  beforeEach(async () => {
    postsService = {
      detailedPost: () => ({ id: 42 }),
      addComment: jasmine.createSpy('addComment').and.returnValue(of({}))
    };

    await TestBed.configureTestingModule({
      imports: [AddCommentFormComponent, ReactiveFormsModule],
      providers: [
        { provide: PostsService, useValue: postsService }
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(AddCommentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and have initial state', () => {
    expect(component).toBeTruthy();
    expect(component.status()).toBe('init');
    expect(component.commentCtrl.value).toBe('');
  });

  it('should mark comment invalid when empty', () => {
    component.commentCtrl.setValue('');
    component.addCommentForm.updateValueAndValidity();
    expect(component.commentCtrl.hasError('required')).toBeTrue();
  });

  it('should mark comment invalid when too long', () => {
    const long = 'x'.repeat(1001);
    component.commentCtrl.setValue(long);
    component.addCommentForm.updateValueAndValidity();
    expect(component.commentCtrl.hasError('maxlength')).toBeTrue();
  });

  it('should accept a valid comment', () => {
    component.commentCtrl.setValue('Looks good!');
    component.addCommentForm.updateValueAndValidity();
    expect(component.commentCtrl.valid).toBeTrue();
  });

  it('should disable submit when invalid or loading', () => {
    const btn = fixture.debugElement
      .query(By.css('#submit-btn'))
      .nativeElement as HTMLButtonElement;

    component.commentCtrl.setValue('');
    component.addCommentForm.updateValueAndValidity();
    fixture.detectChanges();
    expect(btn.disabled).toBeTrue();

    component.commentCtrl.setValue('OK');
    component.addCommentForm.updateValueAndValidity();
    component.status.set('loading');
    fixture.detectChanges();
    expect(btn.disabled).toBeTrue();
  });

  it('should call addComment and transition status on sendComment()', () => {
    const text = 'New comment';
    component.commentCtrl.setValue(text);
    component.addCommentForm.updateValueAndValidity();
    fixture.detectChanges();

    component.sendComment();

    expect(postsService.addComment).toHaveBeenCalledWith(42, text);
    expect(component.commentCtrl.value).toBe('');
    expect(component.status()).toBe('success');
  });
});
