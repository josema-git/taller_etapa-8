import { HeaderComponent } from '@/shared/components/header/header.component';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [HeaderComponent, RouterOutlet],
  templateUrl: './layout.component.html',
})
export default class LayoutComponent {

}
