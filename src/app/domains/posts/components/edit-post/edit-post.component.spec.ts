import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EditPostComponent } from './edit-post.component';
import { PostsService } from '@/shared/services/posts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Post } from '@/shared/models/post';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';


describe('EditPostComponent', () => {
  let component: EditPostComponent;
  let fixture: ComponentFixture<EditPostComponent>;
  let postsServiceSpy: jasmine.SpyObj<PostsService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteStub: any;

  const mockPost: Post = {
    id: 1,
    title: 'Test Title',
    content: 'Test Content',
    excerpt: '',
    likes: 0,
    comments: 0,
    is_liked: false,
    created_at: '',
    author: '',
    team: '',
    permission_level: 0,
    is_public: 1,
    authenticated_permission: 1,
    group_permission: 1,
    author_permission: 2
  };

  beforeEach(async () => {
    const detailedPostSignal = signal<Post>(mockPost);
    spyOn(detailedPostSignal, 'set');

    postsServiceSpy = jasmine.createSpyObj('PostsService', ['getPost', 'editPost'], {
      editingPost: { set: jasmine.createSpy('set') },
      detailedPost: detailedPostSignal
    });

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    activatedRouteStub = {
      snapshot: {
        params: { postId: '1' }
      } as any
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, EditPostComponent],
      providers: [
        { provide: PostsService, useValue: postsServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    postsServiceSpy.getPost.and.returnValue(of(mockPost));
    fixture = TestBed.createComponent(EditPostComponent);
    component = fixture.componentInstance;
  });


  it('should mark form as touched and not submit if form is invalid', () => {
    component.postForm.controls['title'].setValue('');
    component.postForm.controls['content'].setValue('');
    component.editPost();
    expect(component.postForm.touched).toBeTrue();
    expect(postsServiceSpy.editPost).not.toHaveBeenCalled();
  });

  it('should reset editingPost on cancel', () => {
    component.cancel();
    expect(postsServiceSpy.editingPost.set).toHaveBeenCalledWith(0);
  });

  it('should validate title field correctly', () => {
    const titleControl = component.postForm.controls['title'];
    titleControl.setValue('');
    expect(titleControl.hasError('required')).toBeTrue();
    titleControl.setValue('a'.repeat(201));
    expect(titleControl.hasError('maxlength')).toBeTrue();
    titleControl.setValue('Valid Title');
    expect(titleControl.valid).toBeTrue();
  });

  it('should validate content field correctly', () => {
    const contentControl = component.postForm.controls['content'];
    contentControl.setValue('');
    expect(contentControl.hasError('required')).toBeTrue();
    contentControl.setValue('a'.repeat(1001));
    expect(contentControl.hasError('maxlength')).toBeTrue();
    contentControl.setValue('Valid Content');
    expect(contentControl.valid).toBeTrue();
  });
});
