import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { Contact } from '../../../shared/data/interfaces/contact.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  readonly COMPANY_NAME = environment.COMPANY_NAME;
  emailAddress: string = '';
  password: string = "";

  onSubmit() {}


  
  

}
