import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DatePipe }                                    from '@angular/common';
import { RouterModule }                                from '@angular/router';
import { By }                                          from '@angular/platform-browser';
import { of }                                          from 'rxjs';

import { PostComponent }                               from './post.component';
import { PostsService }                                from '@/shared/services/posts.service';
import { Post, Like, PaginatedResponse }               from '@/shared/models/post';

describe('PostComponent', () => {
  let fixture: ComponentFixture<PostComponent>;
  let component: PostComponent;
  let postsServiceSpy: jasmine.SpyObj<PostsService>;

  const samplePost: Post = {
    id: 42,
    title: 'Hello World',
    excerpt: 'Short excerpt',
    content: 'Full content',
    team: 'Team X',
    author: 'Jane Doe',
    created_at: '2025-05-20T14:30:00Z',
    likes: 2,
    comments: 3,
    permission_level: 3,
    is_liked: false,
    is_public: 1,
    authenticated_permission: 0,
    group_permission: 0,
    author_permission: 3
  };

  const fakeLikes: PaginatedResponse<Like> = {
    start_page: 1,
    count: 2,
    previous: null,
    next: null,
    results: [
      { id: 1, author: 1, post: 42, created_at: '2025-05-20T14:00:00Z' },
      { id: 2, author: 2, post: 42, created_at: '2025-05-20T14:30:00Z' }
    ]
  };

  beforeEach(async () => {
    postsServiceSpy = jasmine.createSpyObj('PostsService', [
      'getLikesByPostId',
      'likePost',
      'unlikePost',
      'deletePost'
    ], {
      editingPost: jasmine.createSpyObj('editingPost', ['set'])
    });

    postsServiceSpy.getLikesByPostId.and.returnValue(of(fakeLikes));
    postsServiceSpy.likePost.and.returnValue(of({}));
    postsServiceSpy.unlikePost.and.returnValue(of({}));
    postsServiceSpy.deletePost.and.returnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [
        PostComponent,
        RouterModule.forRoot([])
      ],
      providers: [
        DatePipe,
        { provide: PostsService, useValue: postsServiceSpy }
      ]
    }).compileComponents();

    fixture  = TestBed.createComponent(PostComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('post', samplePost);
    fixture.componentRef.setInput('detail', false);
    fixture.detectChanges();
  });

  it('should render title, team, author, formatted date, and excerpt + Read more link', () => {
    const dp = TestBed.inject(DatePipe);

    const titleEl = fixture.debugElement.query(By.css('#post-title')).nativeElement as HTMLElement;
    expect(titleEl.textContent).toContain(samplePost.title);

    const teamEl = fixture.debugElement.query(By.css('#post-team')).nativeElement as HTMLElement;
    expect(teamEl.textContent).toContain(samplePost.team);

    const authorEl = fixture.debugElement.query(By.css('#post-author')).nativeElement as HTMLElement;
    expect(authorEl.textContent).toContain(samplePost.author);

    const dateEl = fixture.debugElement.query(By.css('#post-date')).nativeElement as HTMLElement;
    const formatted = dp.transform(samplePost.created_at, 'M/d/yy h:mm');
    expect(dateEl.textContent).toContain(formatted!);

    const excerptEl = fixture.debugElement.query(By.css('#post-excerpt')).nativeElement as HTMLElement;
    expect(excerptEl.textContent).toContain(samplePost.excerpt);

    const readMore = fixture.debugElement.query(By.css('#read-more')).nativeElement as HTMLAnchorElement;
    expect(readMore).toBeTruthy();
    expect(readMore.getAttribute('href')).toContain(`/post/${samplePost.id}`);
  });

  it('should render full content and no Read more link in detail mode', () => {
    fixture.componentRef.setInput('detail', true);
    fixture.detectChanges();

    const contentEl = fixture.debugElement.query(By.css('#post-content')).nativeElement as HTMLElement;
    expect(contentEl.textContent).toContain(samplePost.content);
    expect(fixture.debugElement.query(By.css('#read-more'))).toBeNull();
  });

  describe('likes popup', () => {
    it('opens popup and loads likes on chevron click', fakeAsync(() => {
      expect(component.openPopup()).toBeFalse();

      fixture.debugElement.query(By.css('#likes-chevron'))
        .triggerEventHandler('click', { button: 0 });
      fixture.detectChanges();

      expect(component.openPopup()).toBeTrue();
      expect(postsServiceSpy.getLikesByPostId).toHaveBeenCalledWith(samplePost.id, undefined);

      tick();
      fixture.detectChanges();

      const likeAuthors = fixture.debugElement
        .queryAll(By.css('#likes-list p.text-sm'));
      expect(likeAuthors.length).toBe(2);
      expect(likeAuthors[0].nativeElement.textContent).toContain('1');
      expect(likeAuthors[1].nativeElement.textContent).toContain('2');
    }));
  });

  describe('like/unlike', () => {
    it('calls likePost when not liked', () => {
      samplePost.is_liked = false;
      fixture.componentRef.setInput('post', samplePost);
      fixture.detectChanges();

      const likeBtn = fixture.debugElement.query(By.css('#btn-like'));
      likeBtn.triggerEventHandler('click', { button: 0 });
      expect(postsServiceSpy.likePost).toHaveBeenCalledWith(samplePost.id);
    });

    it('calls unlikePost when already liked', () => {
      samplePost.is_liked = true;
      fixture.componentRef.setInput('post', samplePost);
      fixture.detectChanges();

      const likeBtn = fixture.debugElement.query(By.css('#btn-like'));
      likeBtn.triggerEventHandler('click', { button: 0 });
      expect(postsServiceSpy.unlikePost).toHaveBeenCalledWith(samplePost.id);
    });
  });

  it('toggleEditingPost sets editingPost signal', () => {
    const editLink = fixture.debugElement.query(By.css('#btn-edit'));
    editLink.triggerEventHandler('click', { button: 0 });
    expect(postsServiceSpy.editingPost.set).toHaveBeenCalledWith(samplePost.id);
  });

  it('resetEditingPost resets editingPost signal', () => {
    const commentLink = fixture.debugElement.query(By.css('#comments-link'));
    commentLink.triggerEventHandler('click', { button: 0 });
    expect(postsServiceSpy.editingPost.set).toHaveBeenCalledWith(0);
  });

  describe('deleting flow', () => {
    it('toggles delete confirmation dialog', () => {
      expect(component.deleting()).toBeFalse();
      const deleteBtn = fixture.debugElement.query(By.css('#btn-delete'));
      deleteBtn.triggerEventHandler('click', { button: 0 });
      expect(component.deleting()).toBeTrue();
    });

    it('calls deletePost and closes dialog', fakeAsync(() => {
      fixture.debugElement.query(By.css('#btn-delete'))
        .triggerEventHandler('click', { button: 0 });
      fixture.detectChanges();

      const confirmBtn = fixture.debugElement
        .query(By.css('#btn-confirm-delete')).nativeElement as HTMLButtonElement;
      confirmBtn.click();

      tick();
      fixture.detectChanges();

      expect(postsServiceSpy.deletePost).toHaveBeenCalledWith(samplePost.id);
      expect(component.deleting()).toBeFalse();
    }));
  });
});
