import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { CommonModule } from '@angular/common';
import { PostsService } from '@/shared/services/posts.service';

@Component({
  selector: 'app-add-comment-form',
  standalone: true,
  imports: [ReactiveFormsModule, QuillModule, CommonModule],
  templateUrl: './add-comment-form.component.html',
})
export class AddCommentFormComponent {
  private postService = inject(PostsService);
  status = signal<'init' | 'loading' | 'success'>('init');

  addCommentForm = new FormGroup({
    comment: new FormControl('', [Validators.required, Validators.maxLength(1000)])
  });

  get commentCtrl() {
    return this.addCommentForm.controls.comment;
  }

  resetForm() {
    this.addCommentForm.reset();
  }

  sendComment() {
    const rawContent = this.commentCtrl.value?.trim();
    if (!rawContent || rawContent === '<p><br></p>' || this.addCommentForm.invalid) {
      this.addCommentForm.markAllAsTouched();
      return;
    }

    this.status.set('loading');

    console.log('Contenido enviado:', this.commentCtrl.value);
    this.postService.addComment(
      this.postService.detailedPost().id,
      rawContent
    ).subscribe({
      next: () => {
        this.status.set('success');
        this.resetForm();
      }
    });
  }
}
