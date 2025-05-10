import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostComponent } from './post.component';
import { Post } from '@/shared/models/post';

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
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({

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
