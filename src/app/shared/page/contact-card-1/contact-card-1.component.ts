import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact, Communication } from '../../../shared/data/interfaces/contact.model';
import { DataService } from '../../../services/data.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-contact-card-1',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-card-1.component.html',
  styleUrl: './contact-card-1.component.css'
})
export class ContactCard1Component {

  constructor(private cdr: ChangeDetectorRef) {}

  @Input() contact?: Contact;

  updateContact(data: Contact) {
    this.contact = data;
    this.cdr.detectChanges();  // Manually trigger change detection
  }


}
