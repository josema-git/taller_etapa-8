import { Component, Input }                from '@angular/core';
import { ComponentFixture, TestBed }       from '@angular/core/testing';
import { By }                              from '@angular/platform-browser';
import { of }                              from 'rxjs';
import { ActivatedRoute, RouterModule }    from '@angular/router';

import SpecificPostComponent                from './specific-post.component';
import { PostsService }                    from '@/shared/services/posts.service';
import { AuthService }                     from '@/shared/services/auth.service';
import { Post, Comment, PaginatedResponse }from '@/shared/models/post';
import { CommentComponent } from '@/posts/components/comment/comment.component';
import { AddCommentFormComponent } from '@/posts/components/add-comment-form/add-comment-form.component';
import { PostComponent } from '@/posts/components/post/post.component';
import { EditPostComponent } from '@/posts/components/edit-post/edit-post.component';

@Component({
  standalone: true,
  selector: 'app-post',
  template: `<div class="fake-post-detail"></div>`
})
class FakePostComponent {
  @Input() post!: Post;
  @Input() detail!: boolean;
}

@Component({
  standalone: true,
  selector: 'app-comment',
  template: `<div class="fake-comment">{{comment.id}}</div>`
})
class FakeCommentComponent {
  @Input() comment!: Comment;
}

@Component({
  standalone: true,
  selector: 'app-add-comment-form',
  template: `<div class="fake-add-comment"></div>`
})
class FakeAddCommentComponent {}

@Component({
  standalone: true,
  selector: 'app-edit-post',
  template: `<div class="fake-edit-post"></div>`
})
class FakeEditPostComponent {}

describe('SpecificPostComponent', () => {
  let fixture:   ComponentFixture<SpecificPostComponent>;
  let component: SpecificPostComponent;
  let postsSpy:  jasmine.SpyObj<PostsService>;
  let authSpy:   jasmine.SpyObj<AuthService>;

  const samplePost: Post = {
    id: 99, title: 'T', excerpt: '', content: '',
    author: 'X', team: 'Y', created_at: '',
    likes: 0, comments: 0, permission_level: 1,
    is_liked: false, is_public: 1,
    authenticated_permission: 0, group_permission: 0, author_permission: 0
  };
  const sampleComments: Comment[] = [
    { id: 1, post: 99, author: 'A', created_at: '', content: 'c1' },
    { id: 2, post: 99, author: 'B', created_at: '', content: 'c2' }
  ];
  const fakeCommentsResp: PaginatedResponse<Comment> = {
    start_page: 0, count: 2, previous: null, next: null, results: sampleComments
  };

  beforeEach(async () => {
    let editingValue = 0;
    const editingPostSignal = (() => editingValue) as any;
    editingPostSignal.set = (v: number) => editingValue = v;

    let detailedValue = samplePost;
    const detailedPostSignal = (() => detailedValue) as any;
    detailedPostSignal.set = (v: Post) => detailedValue = v;

    let commentsValue = fakeCommentsResp;
    const commentsResponseSignal = (() => commentsValue) as any;
    commentsResponseSignal.set = (v: PaginatedResponse<Comment>) => commentsValue = v;

    postsSpy = jasmine.createSpyObj('PostsService', ['getPost','getCommentsByPostId']);
    postsSpy.detailedPost     = detailedPostSignal;
    postsSpy.commentsResponse = commentsResponseSignal;
    postsSpy.editingPost      = editingPostSignal;
    postsSpy.getPost.and.returnValue(of(samplePost));
    postsSpy.getCommentsByPostId.and.returnValue(of(fakeCommentsResp));

    authSpy = jasmine.createSpyObj('AuthService',['isLoggedIn']);
    authSpy.isLoggedIn.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        SpecificPostComponent
      ],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { params: { postId: 99 } } } },
        { provide: PostsService,   useValue: postsSpy },
        { provide: AuthService,    useValue: authSpy }
      ]
    })
    .overrideComponent(SpecificPostComponent, {
      remove: {
        imports: [
          CommentComponent,
          AddCommentFormComponent,
          PostComponent,
          EditPostComponent
        ]
      },
      add: {
        imports: [
          FakePostComponent,
          FakeCommentComponent,
          FakeAddCommentComponent,
          FakeEditPostComponent
        ]
      }
    })
    .compileComponents();

    fixture   = TestBed.createComponent(SpecificPostComponent);
    component = fixture.componentInstance;
  });

  it('should clear the post-loading spinner once loaded', () => {
    expect(component.postsStatus()).toBe('init');
    fixture.detectChanges();
    expect(component.postsStatus()).toBe('success');
    expect(fixture.debugElement.query(By.css('#posts-loading'))).toBeNull();
  });

  it('when permission_level=0 shows "not found"', () => {
    (postsSpy.detailedPost as any).set({ ...samplePost, permission_level: 0 });
    component.postsStatus.set('success');
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('#not-found'))).toBeTruthy();
  });

  it('renders detail, comments-list and add-form by default', () => {
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.fake-post-detail'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('#comments-header'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('#comments-loading'))).toBeNull();
    expect(fixture.debugElement.queryAll(By.css('.fake-comment')).length).toBe(2);
    expect(fixture.debugElement.query(By.css('#comments-prev'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('#comments-next'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.fake-add-comment'))).toBeTruthy();
  });

  it('clicking comments-prev/next calls getComments()', () => {
    fixture.detectChanges();
    postsSpy.getCommentsByPostId.calls.reset();
    fixture.debugElement.query(By.css('#comments-prev')).triggerEventHandler('click', null);
    expect(postsSpy.getCommentsByPostId).toHaveBeenCalledWith(99, null);
    fixture.debugElement.query(By.css('#comments-next')).triggerEventHandler('click', null);
    expect(postsSpy.getCommentsByPostId).toHaveBeenCalledWith(99, null);
  });

  it('when editingPost matches id shows edit-post instead of comments', () => {
    fixture.detectChanges();
    (postsSpy.editingPost as any).set(99);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.fake-edit-post'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('#comments-list'))).toBeNull();
  });
});
