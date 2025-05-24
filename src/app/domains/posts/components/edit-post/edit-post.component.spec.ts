import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule }          from '@angular/forms';
import { ActivatedRoute }               from '@angular/router';
import { of }                           from 'rxjs';
import { By }                          from '@angular/platform-browser';

import { EditPostComponent }           from './edit-post.component';
import { PostsService }                from '@/shared/services/posts.service';
import { Post }                        from '@/shared/models/post';

describe('EditPostComponent', () => {
  let fixture:   ComponentFixture<EditPostComponent>;
  let component: EditPostComponent;
  let postsServiceSpy: jasmine.SpyObj<PostsService>;

  const initialPost: Post = {
    id: 123,
    title: 'Original Title',
    excerpt: '',
    content: 'Original content',
    author: '',
    created_at: '',
    likes: 0,
    comments: 0,
    team: '',
    permission_level: 0,
    is_liked: false,
    is_public: 1,
    authenticated_permission: 0,
    group_permission: 1,
    author_permission: 2,
  };

  beforeEach(async () => {
    postsServiceSpy = jasmine.createSpyObj(
      'PostsService',
      ['getPost', 'editPost'],
      {
        detailedPost: () => initialPost,
        editingPost: { set: jasmine.createSpy('set') }
      }
    );
    postsServiceSpy.getPost.and.returnValue(of(initialPost));
    postsServiceSpy.editPost.and.returnValue(of(initialPost));

    await TestBed.configureTestingModule({
      imports: [EditPostComponent, ReactiveFormsModule],
      providers: [
        { provide: PostsService, useValue: postsServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { postId: 123 } } }
        }
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(EditPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and patch form with initial post', () => {
    expect(component).toBeTruthy();

    expect(component.titleCtrl.value).toBe(initialPost.title);
    expect(component.contentCtrl.value).toBe(initialPost.content);
    expect(component.isPublicCtrl.value).toBe(initialPost.is_public);
    expect(component.authenticatedPermissionCtrl.value)
      .toBe(initialPost.authenticated_permission);
    expect(component.groupPermissionCtrl.value)
      .toBe(initialPost.group_permission);
    expect(component.authorPermissionCtrl.value)
      .toBe(initialPost.author_permission);

    const titleInput = fixture.debugElement.query(By.css('#blogTitle')).nativeElement as HTMLInputElement;
    expect(titleInput.value).toBe(initialPost.title);

    const contentTextarea = fixture.debugElement.query(By.css('#blogContent')).nativeElement as HTMLTextAreaElement;
    expect(contentTextarea.value).toBe(initialPost.content);

    const publicSelect = fixture.debugElement.query(By.css('#isPublicSelect')).nativeElement as HTMLSelectElement;
    expect(publicSelect.value).toBe(initialPost.is_public.toString());

    const authSelect = fixture.debugElement.query(By.css('#authPermissionSelect')).nativeElement as HTMLSelectElement;
    expect(authSelect.value).toBe(initialPost.authenticated_permission.toString());

    const groupSelect = fixture.debugElement.query(By.css('#groupPermissionSelect')).nativeElement as HTMLSelectElement;
    expect(groupSelect.value).toBe(initialPost.group_permission.toString());

    const ownerSelect = fixture.debugElement.query(By.css('#ownerPermissionSelect')).nativeElement as HTMLSelectElement;
    expect(ownerSelect.value).toBe(initialPost.author_permission.toString());

    expect(postsServiceSpy.getPost).toHaveBeenCalledWith(123);
  });

  describe('form validation', () => {
    it('title is required and maxLength=200', () => {
      component.titleCtrl.setValue('');
      component.titleCtrl.markAsTouched();
      fixture.detectChanges();

      expect(component.titleCtrl.hasError('required')).toBeTrue();
      const titleError = fixture.debugElement.query(By.css('#title-error'));
      expect(titleError).toBeTruthy();
      expect(titleError.nativeElement.textContent).toContain('provide a title');

      const long = 'a'.repeat(201);
      component.titleCtrl.setValue(long);
      component.titleCtrl.markAsTouched();
      fixture.detectChanges();

      expect(component.titleCtrl.hasError('maxlength')).toBeTrue();
      expect(titleError.nativeElement.textContent).toContain('maximum allowed');
    });

    it('content is required and maxLength=1000', () => {
      component.contentCtrl.setValue('');
      component.contentCtrl.markAsTouched();
      fixture.detectChanges();

      expect(component.contentCtrl.hasError('required')).toBeTrue();
      const contentError = fixture.debugElement.query(By.css('#content-error'));
      expect(contentError).toBeTruthy();
      expect(contentError.nativeElement.textContent).toContain('Content is required');

      const long = 'a'.repeat(1001);
      component.contentCtrl.setValue(long);
      component.contentCtrl.markAsTouched();
      fixture.detectChanges();

      expect(component.contentCtrl.hasError('maxlength')).toBeTrue();
      expect(contentError.nativeElement.textContent).toContain('cannot exceed');
    });
  });

  it('clicking cancel-button should reset editingPost signal', () => {
    const cancelBtn = fixture.debugElement.query(By.css('#cancel-button'));
    cancelBtn.triggerEventHandler('click', null);
    expect(postsServiceSpy.editingPost.set).toHaveBeenCalledWith(0);
  });

  describe('editPost()', () => {
    it('does nothing when form invalid', () => {
      component.titleCtrl.setValue('');
      component.postForm.markAllAsTouched();
      component.editPost();
      expect(postsServiceSpy.editPost).not.toHaveBeenCalled();
    });

    it('submits when valid', () => {
      component.titleCtrl.setValue('New Title');
      component.contentCtrl.setValue('New content');
      component.isPublicCtrl.setValue(0);
      component.authenticatedPermissionCtrl.setValue(1);
      component.groupPermissionCtrl.setValue(2);
      component.authorPermissionCtrl.setValue(2);

      component.postForm.markAllAsTouched();
      fixture.detectChanges();

      component.editPost();

      expect(postsServiceSpy.editPost).toHaveBeenCalledWith(jasmine.objectContaining({
        id: initialPost.id,
        title: 'New Title',
        content: 'New content',
        is_public: 0,
        authenticated_permission: 1,
        group_permission: 2,
        author_permission: 2
      }));
    });
  });
});
