import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { lastValueFrom, of, throwError } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

import { PostsService } from './posts.service';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { interceptorsInterceptor } from '../interceptors.interceptor';
import { createStorageServiceMock } from './storage-service.mock';
import { PaginatedResponse, Post, Comment, Like } from '../models/post';

describe('PostsService', () => {
  let postsService: PostsService;
  let authService: AuthService;
  const testUser = { username: 'user@test.com', password: 'testpassword' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([interceptorsInterceptor])),
        PostsService,
        { provide: StorageService, useValue: createStorageServiceMock() },
        AuthService
      ]
    });

    postsService = TestBed.inject(PostsService);
    authService  = TestBed.inject(AuthService);
  });

  async function createTestPost(): Promise<number> {
    await lastValueFrom(authService.login(testUser));

    const newPost: Post = {
      id: 0,
      author: '',
      title: 'Test Post',
      content: 'This is a test post created by integration tests.',
      excerpt: 'Test excerpt',
      likes: 0,
      comments: 0,
      is_liked: false,
      created_at: '',
      team: '',
      permission_level: 0,
      is_public: 1,
      authenticated_permission: 2,
      group_permission: 2,
      author_permission: 2
    };
    
    postsService.detailedPost.set(newPost);

    const page = await lastValueFrom(
      postsService.addPost().pipe(
        switchMap(() => postsService.getPosts())
      )
    );

    const created = page.results.find(post => post.title === newPost.title);
    if (!created) {
      throw new Error('Test post was not created');
    }

    return created.id;
  }

  it('should fetch the first page of posts', async () => {
    const page: PaginatedResponse<Post> = await lastValueFrom(postsService.getPosts());
    expect(page.start_page).toBe(0);
    expect(page.results.length).toBeGreaterThan(0);
  });

  it('should create and then delete a post', async () => {
    const postId = await createTestPost();
    let page = await lastValueFrom(postsService.getPosts());
    expect(page.results.some(p => p.id === postId)).toBeTrue();

    await lastValueFrom(postsService.deletePost(postId));
    page = await lastValueFrom(postsService.getPosts());
    expect(page.results.some(p => p.id === postId)).toBeFalse();
  });

  it('should retrieve a specific post by ID', async () => {
    const postId = await createTestPost();
    const fetchedPost = await lastValueFrom(postsService.getPost(postId));
    expect(fetchedPost.id).toBe(postId);
    expect(fetchedPost.title).toBe('Test Post');

    await lastValueFrom(postsService.deletePost(postId));
  });

  it('should reset detailedPost and comments to its initial empty state', () => {
    postsService.detailedPost.set({
      id: 42,
      author: 'Tester',
      title: 'Temporary Title',
      content: 'Temporary content',
      excerpt: 'Temp excerpt',
      likes: 5,
      comments: 3,
      is_liked: true,
      created_at: 'now',
      team: 'TestTeam',
      permission_level: 7,
      is_public: 1,
      authenticated_permission: 1,
      group_permission: 1,
      author_permission: 2
    });
    postsService.commentsResponse.set({
      start_page: 0,
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          author: 'Tester',
          post: 42,
          content: 'Test comment',
          created_at: 'now',
        }
      ],
  });

    postsService.resetPost();
    expect(postsService.detailedPost()).toEqual({
      id: 0,
      title: '',
      content: '',
      excerpt: '',
      author: '',
      created_at: '',
      likes: 0,
      comments: 0,
      is_liked: false,
      team: '',
      permission_level: 0,
      is_public: 0,
      authenticated_permission: 0,
      group_permission: 0,
      author_permission: 0
    });
    expect(postsService.commentsResponse()).toEqual({
      start_page: 0,
      count: 0,
      next: null,
      previous: null,
      results: []
    });
  });
  
  it('should edit an existing post', async () => {
    const postId = await createTestPost();
    const updatedPost = { ...postsService.detailedPost(), id: postId, title: 'Updated Title' };
    postsService.detailedPost.set(updatedPost);

    await lastValueFrom(postsService.editPost(updatedPost));
    const fetched = await lastValueFrom(postsService.getPost(postId));
    expect(fetched.title).toBe('Updated Title');

    await lastValueFrom(postsService.deletePost(postId));
  });

  it('should like and unlike a post without throwing', async () => {
    const postId = await createTestPost();

    try {
      await lastValueFrom(postsService.likePost(postId));
    } catch (error) {
      fail(`likePost threw an error: ${JSON.stringify(error)}`);
    }
    const likesPage: PaginatedResponse<Like> = await lastValueFrom(postsService.getLikesByPostId(postId));
    expect(likesPage.count).toBeGreaterThan(0);

    try {
      await lastValueFrom(postsService.unlikePost(postId));
    } catch (error) {
      fail(`unlikePost threw an error: ${JSON.stringify(error)}`);
    }
    const afterUnlike: PaginatedResponse<Like> = await lastValueFrom(postsService.getLikesByPostId(postId));
    expect(afterUnlike.count).toBeLessThanOrEqual(likesPage.count);

    await lastValueFrom(postsService.deletePost(postId));
  });

  it('should add and list comments for a post', async () => {
    const postId = await createTestPost();

    await lastValueFrom(postsService.addComment(postId, 'This is a test comment'));   
    const commentsPage: PaginatedResponse<Comment> = await lastValueFrom(postsService.getCommentsByPostId(postId));
    expect(commentsPage.count).toBeGreaterThan(0);
    expect(commentsPage.results.some(c => c.content.includes('test comment'))).toBeTrue();

    await lastValueFrom(postsService.deletePost(postId));
  });

  it('should set error signal when getPosts fails', async () => {
    spyOn((postsService as any).http, 'get').and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server Error' }))
    );
  
    await expectAsync(lastValueFrom(postsService.getPosts()))
      .toBeRejectedWith(jasmine.objectContaining({ status: 500 }));
  
    expect(postsService.error()).toContain('Error fetching posts');
  });


  it('should set error signal when addPost fails', async () => {
    spyOn((postsService as any).http, 'post').and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 400, error: 'Invalid data' }))
    );
  
    await expectAsync(lastValueFrom(postsService.addPost()))
      .toBeRejectedWith(jasmine.objectContaining({ status: 400 }));
  
    expect(postsService.error()).toContain('Error adding post');
  });
  
  it('editPost() should set editingPost signal immediately', async () => {
    const postId = await createTestPost();
    const updated = { ...postsService.detailedPost(), id: postId, title: 'New' };
  
    const spyPut = spyOn((postsService as any).http, 'put')
      .and.returnValue(of(updated));
  
    const edit$ = postsService.editPost(updated);
  
    expect(postsService.editingPost()).toBe(postId);
  
    await lastValueFrom(edit$);
  });
  
  it('should page forward when next link is present', async () => {
    const page1 = { start_page: 0, count: 2, next: '/post/?page=2', previous: null, results: [] };
    const page2 = { start_page: 1, count: 2, next: null, previous: null, results: [] };
  
    spyOn((postsService as any).http, 'get').and.callFake((url: string) => {
      return of(url.includes('page=2') ? page2 : page1);
    });
  
    const p1 = await lastValueFrom(postsService.getPosts());
    expect(p1.start_page).toBe(0);
    expect(postsService.postsResponse()).toEqual(page1);
  
    const p2 = await lastValueFrom(postsService.getPosts(p1.next!));
    expect(p2.start_page).toBe(1);
    expect(postsService.postsResponse()).toEqual(page2);
  });
  
  it('should return empty likes page on error', async () => {
    spyOn((postsService as any).http, 'get').and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 0, statusText: 'Network Error' }))
    );
    const likes = await lastValueFrom(postsService.getLikesByPostId(999));
    expect(likes.results).toEqual([]);
    expect(postsService.error()).toContain('Error fetching likes');
  });
  
  
});