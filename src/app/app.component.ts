import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from './shared/page/header/header.component';
import { FooterComponent } from './shared/page/footer/footer.component';
import { DataService } from './services/data.service';
import { AsideComponent } from './shared/page/aside/aside.component';
import { AsideService } from './services/aside.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, AsideComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'taliferro-platform';

  content: string = '';
  isVisible: boolean = false;

  constructor(private asideService: AsideService) {
    this.asideService.isVisible$.subscribe(visible => this.isVisible = visible);
    this.asideService.content$.subscribe(content => this.content = content);
  }

  ngOnInit() {

  }

  get shouldShowAside(): boolean {
    return this.asideService.isVisibleValue; // Ensure this value is consistent between server and client initial renders
  }


}
