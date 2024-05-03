import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, RouterModule, NavigationEnd } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AsideService } from '../../../services/aside.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  encapsulation: ViewEncapsulation.None  
})
export class HeaderComponent {

  version: string = environment.VERSION;
  companyName: string = environment.COMPANY_NAME;



  constructor(private router: Router, private asideService: AsideService) {
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateHelpContentBasedOnRoute(event.urlAfterRedirects);
      }
    });
  }

  openHelp() {
    let content = `Help content for ${this.router.url}`;
    this.asideService.updateContent(content);
    this.asideService.toggleVisibility();
  }

  private updateHelpContentBasedOnRoute(url: string) {
    let content = 'Help content for ' + url;
    this.asideService.updateContent(content);
  }


  logout() : void {

  }

}
