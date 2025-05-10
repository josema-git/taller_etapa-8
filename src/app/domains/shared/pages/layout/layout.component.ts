import { FooterComponent } from '@/shared/components/footer/footer.component';
import { HeaderComponent } from '@/shared/components/header/header.component';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [HeaderComponent, RouterOutlet, FooterComponent],
  templateUrl: './layout.component.html',
})
export default class LayoutComponent {

}
