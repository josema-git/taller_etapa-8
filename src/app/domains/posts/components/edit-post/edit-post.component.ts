import { Component, inject, signal } from '@angular/core';
import { PostsService } from '@/shared/services/posts.service';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-edit-post',
  imports: [ReactiveFormsModule, QuillModule],
  templateUrl: './edit-post.component.html',
})
export class EditPostComponent {
  postService = inject(PostsService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  postId = signal(0);

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

  constructor() {
    this.postId.set(this.route.snapshot.params['postId']);
    this.postService.getPost(this.postId()).subscribe(
      () => {
        const post = this.postService.detailedPost();
        this.postForm.patchValue({
          title: post.title,
          content: post.content,
          is_public: post.is_public,
          authenticated_permission: post.authenticated_permission,
          group_permission: post.group_permission,
          author_permission: post.author_permission
        });
      }
    );
    
  }

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

  cancel() {
    this.postService.editingPost.set(0);
  }

  editPost() {
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      return;
    }
    const formValues = this.postForm.getRawValue();
    const newPost = {
      ...this.postService.detailedPost(),
      title: formValues.title,
      content: formValues.content,
      is_public: formValues.is_public,
      authenticated_permission: formValues.authenticated_permission,
      group_permission: formValues.group_permission,
      author_permission: formValues.author_permission,
    }
    this.postService.editPost(newPost).subscribe(
      () => {
        this.postService.editingPost.set(0);
        this.postService.detailedPost.set(newPost);
        this.router.navigate(['/post', this.postId()]);
      }
    );
  }
}
