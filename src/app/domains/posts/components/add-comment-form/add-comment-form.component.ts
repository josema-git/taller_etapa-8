import { PostsService } from '@/shared/services/posts.service';
import { Component, signal, inject, output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

@Component({
  selector: 'app-add-comment-form',
  imports: [ReactiveFormsModule],
  templateUrl: './add-comment-form.component.html',
})
export class AddCommentFormComponent {
  private postService = inject(PostsService);

  comment = output<string>();

  status = signal<'init' | 'loading' | 'success' | 'failed'>('init');

  addCommentForm = new FormGroup({
    comment: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(400),
      ]
    })
  });

  get commentCtrl() {
    return this.addCommentForm.controls.comment;
  }

sendComment() {
  if (this.addCommentForm.invalid) {
    this.addCommentForm.markAllAsTouched();
    return;
  }
  const commentValue = this.commentCtrl.value;
  this.comment.emit(commentValue); 

}

}
