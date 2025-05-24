import { Component, input, OnInit } from '@angular/core';
import { Comment } from '@/shared/models/post';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './comment.component.html',
})
export class CommentComponent implements OnInit {
  comment = input<Comment>();
  sanitizedContent: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    const content = this.comment()?.content || '';
    this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(content);
  }
}
