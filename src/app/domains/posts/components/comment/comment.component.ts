import { Component, input } from '@angular/core';
import { Comment } from '@/shared/models/post';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-comment',
  imports: [DatePipe],
  templateUrl: './comment.component.html',
})
export class CommentComponent {
  comment = input.required<Comment>();
}
