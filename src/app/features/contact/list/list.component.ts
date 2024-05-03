import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { Contact } from '../../../shared/data/interfaces/contact.model';
import { Observable } from 'rxjs';
import { DataService } from '../../../services/data.service';
import { FilterContactsPipe } from '../../../shared/filters/contact-filter.pipe';
import { ContactService } from '../../../services/contact.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, FilterContactsPipe],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent implements OnInit {

  searchText: string = '';
  @Output() id = new EventEmitter();

  contacts$!: Observable<any[]>;
  selectedContact!: Contact;
  filteredContacts: Contact[] = [];

  constructor(private dataService: DataService, private router: Router, private contactService: ContactService) { }


  ngOnInit() {
    this.readDatabase();
    // setTimeout(() => { this.readDatabase()  }, 3000);
  }

  readDatabase() : void {
    this.contacts$ = this.dataService.getRealtimeData('CONTACTS');
    this.contacts$.subscribe(data => {
      this.filteredContacts = data; // Assuming initial data without filter applied.
      this.print(data);
    });
  }
  
  exportToCSV() {
    let filteredData = this.applyFilter(this.filteredContacts, this.searchText);
    let csvData = this.convertToCSV(filteredData);
    let blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'contacts.csv');
  }
  
  applyFilter(contacts: Contact[], filter: string): Contact[] {
    if (!filter) return contacts;
    return contacts.filter(contact => {
      const term = filter.toLowerCase();
      return (
        contact.firstName?.toLowerCase().includes(term) || 
        contact.lastName?.toLowerCase().includes(term) ||
        (contact.emailAddresses && contact.emailAddresses.some(email => email.emailAddress.toLowerCase().includes(term))) ||
        (contact.company && contact.company.name.toLowerCase().includes(term)) ||
        (contact.profileTypes && contact.profileTypes.some(type => type.toLowerCase().includes(term)))
      );
    });
  }
  

  convertToCSV(data: Contact[]): string {
    const replacer = (key: any, value: any) => value === null ? '' : value; 
    const header = Object.keys(data[0]);
    let csv = data.map(row => header.map(fieldName => JSON.stringify((row as any)[fieldName], replacer)).join(','));
    csv.unshift(header.join(','));
    return csv.join('\r\n');
  }
  
  
  

  public onView(contact: Contact): void {
    this.contactService.changeContact(contact);
    this.router.navigate(['/contact-edit']);  // Adjust the route as needed    
  }

  navigateToEditContact(): void {
    this.contactService.resetContact();
    this.router.navigate(['/contact-edit']);
  }

  print(data: any): void {
    console.log(JSON.stringify(data, null, 2));
  }


}
