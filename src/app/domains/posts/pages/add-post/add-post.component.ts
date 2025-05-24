import { Component, inject, signal } from '@angular/core';
import { PostsService } from '@/shared/services/posts.service';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLinkWithHref } from '@angular/router';
import { Router } from '@angular/router';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-add-post',
  imports: [ReactiveFormsModule, RouterLinkWithHref, QuillModule],
  templateUrl: './add-post.component.html',
})
export default class AddPostComponent {
  postService = inject(PostsService);
  router = inject(Router);

  post = this.postService.detailedPost;

  public readonly authorPermissionOptions = [
    { value: 2, label: 'Read & Write' },
  ];

  public readonly public_permission_options = [
    { value: 0, label: 'None' },
    { value: 1, label: 'Read Only' },
  ]

  public readonly auth_group_permission_options = [
    { value: 0, label: 'None' },
    { value: 1, label: 'Read Only' },
    { value: 2, label: 'Read & Write' },
  ];

  postForm = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(200),
      ]
    }),
    content: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(1000),
      ]
    }),
    is_public: new FormControl(0, {
      nonNullable: true,
      validators: [
        Validators.required,
      ]
    }),
    authenticated_permission: new FormControl(1, {
      nonNullable: true,
      validators: [
        Validators.required,
      ]
    }),
    group_permission: new FormControl(1, {
      nonNullable: true,
      validators: [
        Validators.required,
      ]
    }),
    author_permission: new FormControl(2, {
      nonNullable: true,
      validators: [
        Validators.required,
      ]
    })
  });

  get titleCtrl() { return this.postForm.controls.title; }
  get contentCtrl() { return this.postForm.controls.content; }
  get isPublicCtrl() { return this.postForm.controls.is_public; }
  get authenticatedPermissionCtrl() { return this.postForm.controls.authenticated_permission; }
  get groupPermissionCtrl() { return this.postForm.controls.group_permission; }
  get authorPermissionCtrl() { return this.postForm.controls.author_permission; }

  resetForm() {
    this.postForm.reset({
      title: '',
      content: '',
      is_public: 0,
      authenticated_permission: 1,
      group_permission: 1,
      author_permission: 2
    });
  }

  addPost() {
    if (this.postForm.invalid) {
      console.log('Form is invalid');
      this.postForm.markAllAsTouched();
      return;
    }
    const formValues = this.postForm.getRawValue();
    this.post.set({
      ...this.post(),
      title: formValues.title,
      content: formValues.content,
      is_public: formValues.is_public,
      authenticated_permission: formValues.authenticated_permission,
      group_permission: formValues.group_permission,
      author_permission: formValues.author_permission,
    });
    this.postService.addPost().subscribe(
      () => {
        console.log('Post added successfully');
        this.router.navigate(['/']);
      }
    );
  }
}
