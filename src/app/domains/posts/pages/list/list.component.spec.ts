import { Component, Input }                   from '@angular/core';
import { ComponentFixture, TestBed }          from '@angular/core/testing';
import { By }                                 from '@angular/platform-browser';
import { of, throwError }                     from 'rxjs';
import { RouterModule }                       from '@angular/router';
import ListComponent                           from './list.component';
import { PostsService }                        from '@/shared/services/posts.service';
import { AuthService }                         from '@/shared/services/auth.service';
import { Post }                                from '@/shared/models/post';

@Component({
  standalone: true,
  selector: 'app-post',
  template: `<div class="fake-post" [attr.data-id]="post.id"></div>`
})
class FakePostComponent {
  @Input() post!: Post;
}

describe('ListComponent (simplified)', () => {
  let fixture:         ComponentFixture<ListComponent>;
  let component:       ListComponent;
  let postsSpy:        jasmine.SpyObj<PostsService>;
  let authSpy:         jasmine.SpyObj<AuthService>;

  const samplePosts: Post[] = [
    { id: 1, title: 'A1', excerpt:'', content:'', team:'T1', author:'A1',
      created_at:'', likes:0, comments:0, permission_level:0,
      is_liked:false, is_public:1,
      authenticated_permission:0, group_permission:0, author_permission:0 },
    { id: 2, title: 'A2', excerpt:'', content:'', team:'T2', author:'A2',
      created_at:'', likes:0, comments:0, permission_level:0,
      is_liked:false, is_public:1,
      authenticated_permission:0, group_permission:0, author_permission:0 }
  ];

  const fakeResp = {
    start_page: 0,
    count:      2,
    previous:   'prev-url',
    next:       'next-url',
    results:    samplePosts
  };

  beforeEach(async () => {
    postsSpy = jasmine.createSpyObj(
      'PostsService',
      ['getPosts'],
      { postsResponse: () => fakeResp }
    );
    postsSpy.getPosts.and.returnValue(of(fakeResp));

    authSpy = jasmine.createSpyObj('AuthService',['isLoggedIn']);
    authSpy.isLoggedIn.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [
        ListComponent,
        FakePostComponent,
        RouterModule.forRoot([])
      ],
      providers: [
        { provide: PostsService, useValue: postsSpy },
        { provide: AuthService,  useValue: authSpy  },
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('displays the loading indicator when status==="loading"', () => {
    component.status.set('loading');
    fixture.detectChanges();
    const loading = fixture.debugElement.query(By.css('#loading-indicator'));
    expect(loading).toBeTruthy();
    expect(loading.nativeElement.textContent).toContain('Loading post');
  });

  it('shows correct page-info "0 - 2 of 2"', () => {
    const info = fixture.debugElement.query(By.css('#page-info')).nativeElement;
    expect(info.textContent.trim()).toBe('0 - 2 of 2');
  });

  it('prev/next buttons invoke getposts() with correct URLs', () => {
    postsSpy.getPosts.calls.reset();
    fixture.debugElement.query(By.css('#prev-btn'))
      .triggerEventHandler('click', null);
    expect(postsSpy.getPosts).toHaveBeenCalledWith('prev-url');

    fixture.debugElement.query(By.css('#next-btn'))
      .triggerEventHandler('click', null);
    expect(postsSpy.getPosts).toHaveBeenCalledWith('next-url');
  });

  it('renders the “Create” link when logged in and hides when not', () => {
    let link = fixture.debugElement.query(By.css('#create-link'));
    expect(link).toBeTruthy();

    authSpy.isLoggedIn.and.returnValue(false);
    fixture.detectChanges();

    link = fixture.debugElement.query(By.css('#create-link'));
    expect(link).toBeNull();
  });

  it('on getposts() error resets status and sets an error', () => {
    postsSpy.getPosts.and.returnValue(throwError(() => 'fail'));
    component.getposts('url');
    fixture.detectChanges();
    expect(component.status()).toBe('init');
    expect(component.error()).toContain('error loading posts');
  });
});
