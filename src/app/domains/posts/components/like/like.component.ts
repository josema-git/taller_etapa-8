import { Like } from '@/shared/models/post';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-like',
  imports: [],
  templateUrl: './like.component.html',
})
export class LikeComponent {
like = input.required<Like>();
}
