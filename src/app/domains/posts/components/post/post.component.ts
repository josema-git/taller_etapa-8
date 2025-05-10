import { Component, inject, input, signal } from '@angular/core';
import { Like, Post } from '@/shared/models/post';
import { DatePipe } from '@angular/common';
import PostsService from '@/shared/services/posts.service';
import { LikeComponent } from '../like/like.component';

@Component({
  selector: 'app-post',
  imports: [DatePipe, LikeComponent],
  templateUrl: './post.component.html',
})
export class PostComponent{
postsService = inject(PostsService);
post = input.required<Post>();
openPopup = signal(false);
likes = signal<Like[]>([]);

getLikes(){
  this.postsService.getLikesByPostId(this.post().id).subscribe({
    next: (response) => {
      this.likes.set(response.results);
      console.log(this.likes());
    },
    error: (err) => {
      console.error(err);
    }
  });
}

togglePopup() {
  this.openPopup.set(!this.openPopup());
}

toggleLike() {
  if (this.post().is_liked) {
    this.postsService.unlikePost(this.post().id).subscribe({
      next: () => {
        this.post().is_liked = false;
        this.post().likes -= 1;
        this.getLikes();
      },
      error: (err) => {
        console.error(err);
      }
    });
  } else {
    this.postsService.likePost(this.post().id).subscribe({
      next: () => {
        this.post().is_liked = true;
        this.post().likes += 1;
        this.getLikes();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}

}
