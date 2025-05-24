import { ComponentFixture, TestBed, } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

import AddPostComponent from './add-post.component';
import { PostsService } from '@/shared/services/posts.service';
import ListComponent from '@/posts/pages/list/list.component';

describe('AddPostComponent', () => {
  let fixture: ComponentFixture<AddPostComponent>;
  let component: AddPostComponent;
  let postsServiceSpy: jasmine.SpyObj<PostsService>;
  let router: Router;

  beforeEach(async () => {
    const initialPost = {
      id: 99,
      title: '',
      content: '',
      is_public: 0,
      authenticated_permission: 1,
      group_permission: 1,
      author_permission: 2,
    };
    const detailSignal = jasmine.createSpy('detailSignal')
      .and.callFake(() => initialPost);
    (detailSignal as any).set = jasmine.createSpy('setDetail');

    postsServiceSpy = jasmine.createSpyObj(
      'PostsService',
      ['addPost'],
      { detailedPost: detailSignal }
    );
    postsServiceSpy.addPost.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [
        AddPostComponent,
        ReactiveFormsModule,
        RouterModule.forRoot([{ path: '', component: ListComponent }])
      ],
      providers: [
        { provide: PostsService, useValue: postsServiceSpy }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(AddPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and default form values', () => {
    expect(component).toBeTruthy();
    const title = fixture.debugElement.query(By.css('#title-input')).nativeElement;
    const content = fixture.debugElement.query(By.css('#content-input')).nativeElement;
    expect(title.value).toBe('');
    expect(content.value).toBe('');
  });

  it('should validate title and content', () => {
    component.titleCtrl.setValue('');
    component.titleCtrl.markAsTouched();
    fixture.detectChanges();
    expect(component.titleCtrl.hasError('required')).toBeTrue();

    component.contentCtrl.setValue('');
    component.contentCtrl.markAsTouched();
    fixture.detectChanges();
    expect(component.contentCtrl.hasError('required')).toBeTrue();

    component.titleCtrl.setValue('x'.repeat(201));
    component.titleCtrl.markAsTouched();
    fixture.detectChanges();
    expect(component.titleCtrl.hasError('maxlength')).toBeTrue();

    component.contentCtrl.setValue('x'.repeat(1001));
    component.contentCtrl.markAsTouched();
    fixture.detectChanges();
    expect(component.contentCtrl.hasError('maxlength')).toBeTrue();
  });

  it('cancel button should reset form', () => {
    component.titleCtrl.setValue('Foo');
    component.resetForm();
    expect(component.titleCtrl.value).toBe('');
  });

  it('save button should be disabled when form invalid', () => {
    const saveBtn = fixture.debugElement.query(By.css('#save-btn'))
      .nativeElement as HTMLButtonElement;
    component.titleCtrl.setValue('');
    component.contentCtrl.setValue('');
    fixture.detectChanges();
    expect(saveBtn.disabled).toBeTrue();
  });

  it('should call addPost and navigate on valid submit', (() => {
    component.titleCtrl.setValue('New Title');
    component.contentCtrl.setValue('Some content');
    component.isPublicCtrl.setValue(1);
    component.authenticatedPermissionCtrl.setValue(1);
    component.groupPermissionCtrl.setValue(1);
    component.authorPermissionCtrl.setValue(2);
    fixture.detectChanges();

    const saveBtn = fixture.debugElement.query(By.css('#save-btn'))
      .nativeElement as HTMLButtonElement;
    expect(saveBtn.disabled).toBeFalse();

    saveBtn.click();
    fixture.detectChanges();

    expect(postsServiceSpy.addPost).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  }));
});
