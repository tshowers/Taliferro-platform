import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact, Communication } from '../../../shared/data/interfaces/contact.model';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-read',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './read.component.html',
  styleUrl: './read.component.css'
})
export class ReadComponent {

  @Input() contact?: Contact;

  constructor(private dataService: DataService) {}


  logCommunication(contactId: string): void {
    const newCommunication: Communication = {
      contactId: contactId,
      date: new Date().toISOString() // Use ISO string for consistent time formatting
    };

    this.dataService.addDocument('COMMUNICATIONS', newCommunication)
      .then(() => {
        console.log('Communication logged successfully');
        // Optionally perform further actions like notification or UI update
      })
      .catch(error => {
        console.error('Failed to log communication:', error);
      });
  }


}
