import { PostsService } from '@/shared/services/posts.service';
import { Component, signal, inject } from '@angular/core';
import { QuillModule } from 'ngx-quill';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

@Component({
  selector: 'app-add-comment-form',
  imports: [ReactiveFormsModule, QuillModule],
  templateUrl: './add-comment-form.component.html',
})
export class AddCommentFormComponent {
  private postService = inject(PostsService);

  status = signal<'init' | 'loading' | 'success'>('init');

  addCommentForm = new FormGroup({
    comment: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(1000),
      ]
    })
  });

  get commentCtrl() {
    return this.addCommentForm.controls.comment;
  }

  resetForm() {
    this.addCommentForm.reset();
  }

  sendComment() {
    if (this.addCommentForm.invalid) {
      this.addCommentForm.markAllAsTouched();
      return;
    }
    this.status.set('loading');

    this.postService.addComment(this.postService.detailedPost().id, this.commentCtrl.value).subscribe({
      next: () => {
        this.status.set('success');
      }
    });
    this.resetForm();
  }
}
