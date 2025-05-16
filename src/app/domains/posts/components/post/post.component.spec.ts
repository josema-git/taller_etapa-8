import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostComponent } from './post.component';
import { Post } from '@/shared/models/post';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

class router {
  navigate = jasmine.createSpy('navigate');
}

describe('PostComponent', () => {
  let component: PostComponent;
  let fixture: ComponentFixture<PostComponent>;
  let mockPost: Post = {
    id: 1,
    title: 'Test Post',
    excerpt: 'This is the content of the test post.',
    author: 'John Doe',
    created_at: '2023-10-01',
    likes: 0,
    comments: 0,
    team: 'Test Team',
    permission_level: 1,
    is_liked: false,
    content: 'This is the content of the test post.',
    is_public: 1,
    authenticated_permission: 1,
    group_permission: 1,
    author_permission: 2,
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([])],
      imports: [PostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('post', mockPost);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
