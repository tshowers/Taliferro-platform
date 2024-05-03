import { Component, OnInit, ViewChild, ElementRef, } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Contact, Communication } from '../../../shared/data/interfaces/contact.model';
import { ReadComponent } from '../read/read.component';
import { DataService } from '../../../services/data.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router'; // Import Router from Angular's router package
import { filter } from 'rxjs/operators';
import { ContactService } from '../../../services/contact.service';
import { environment } from '../../../../environments/environment';
import { Chart, registerables } from 'chart.js';
import { LoggerService } from '../../../services/logger.service';


// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, ReadComponent],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css'
})
export class CreateComponent implements OnInit {

  currentStep = 0;
  totalSteps: number = 14;
  isLoading = false;
  public production: boolean;
  public diagDisplay = "none";

  public toggleDisplay = false;

  @ViewChild('lastContactTimelineChart') private lastContactTimelineChartRef!: ElementRef<HTMLCanvasElement>;
  lastContactTimelineChart!: Chart;

  @ViewChild('communicationFrequencyChart') private communicationFrequencyChartRef!: ElementRef<HTMLCanvasElement>;
  communicationFrequencyChart!: Chart;



  contact: Contact = {
    firstName: '',
    middleName: '',
    lastName: '',
    images: [{
      src: 'assets/nophoto.jpg',
      alt: 'No photo available'
    }],
    company: {  // Add default company object here
      name: '',  // Default empty name
      numberOfEmployees: '', // Default value can be empty or a placeholder
      other: '', // Default or initial value
      phoneNumbers: [], // Initialize as empty array
      emailAddresses: [], // Initialize as empty array
      addresses: [], // Initialize as empty array
      url: '', // Default or initial value
      sicCode: '', // Default or initial value
      status: '', // Default or initial value
      shared: false // Default boolean value
    },
    // Default values for new properties
    connectionDetails: {
      startDate: new Date(),  // Consider what default makes sense for your use case
      mutualConnections: 0,
      transactionHistory: []
    },
    engagements: [],
    interactions: [],
    acquisitionSource: 'Unknown',
    dateAdded: new Date(),
    lastContacted: new Date()
  };;

  constructor(private dataService: DataService, private router: Router, private contactService: ContactService, private logger: LoggerService) {
    this.production = environment.production;

  }

  ngOnInit() {

    this.contactService.currentContact.subscribe(contact => {
      if (contact) {
        let periodStartDate = new Date();
        periodStartDate.setDate(periodStartDate.getDate() - 30); // Set to 30 days ago

        this.contact = contact;
        const lastContactData = this.processSingleContactData(contact);
        setTimeout(() => {
          this.createSingleContactTimelineChart(lastContactData);
          if (contact.id)
            this.loadAndProcessSingleContactFrequency(contact.id, periodStartDate);
        }, 0);
      }

    });

    this.logger.info("Using this contact", JSON.stringify(this.contact, null, 2));
  }

  nextStep() {
    this.currentStep++;
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  addEmailAddress() {
    this.contact.emailAddresses = this.contact.emailAddresses || [];
    this.contact.emailAddresses.push({ emailAddress: '', emailAddressType: '', blocked: false });
  }

  removeEmailAddress(index: number) {
    if (this.contact.emailAddresses)
      if (index > -1) {
        this.contact.emailAddresses.splice(index, 1);
      }
  }
  addPhoneNumber() {
    this.contact.phoneNumbers = this.contact.phoneNumbers || [];
    this.contact.phoneNumbers.push({ phoneNumber: '', phoneNumberType: '' });
  }

  removePhoneNumber(index: number) {
    if (this.contact.phoneNumbers)
      if (index > -1) {
        this.contact.phoneNumbers.splice(index, 1);
      }
  }

  addAddress() {
    this.contact.addresses = this.contact.addresses || [];
    this.contact.addresses.push({ streetAddress: '', city: '', state: '', zip: '', country: '', county: '', addressType: '', latitude: 0, longitude: 0 });
  }

  removeAddress(index: number) {
    if (this.contact.addresses)
      if (index > -1) {
        this.contact.addresses.splice(index, 1);
      }
  }

  addSocialMedia() {
    this.contact.socialMedia = this.contact.socialMedia || [];
    this.contact.socialMedia.push({ platform: '', url: '', username: '', verified: false });
  }

  removeSocialMedia(index: number) {
    if (this.contact.socialMedia)
      if (index > -1) {
        this.contact.socialMedia.splice(index, 1);
      }
  }

  print(): void {
    console.log(JSON.stringify(this.contact, null, 2));
  }

  setRecordState(): void {
    this.contact.dateAdded = new Date();
    this.contact.lastUpdated = new Date();
    this.contact.lastViewed = new Date();
  }

  onSubmit() {
    this.isLoading = true;  // Show spinner

    this.setRecordState();

    this.print(); // Assuming print() is a method in your component

    this.dataService.addDocument('CONTACTS', this.contact)
      .then(docId => {
        console.log('Document added with ID:', docId);
        // Navigate to the contact-list page on success
        this.router.navigate(['/contact-list']);
      })
      .catch(error => {
        console.error('Error adding contact:', error);
        // Navigate to an error page on failure
        this.router.navigate(['/error']); // Assuming you have an error route defined
      });
  }

  public toggleDiagnostic(): void {
    this.diagDisplay = (this.diagDisplay == "none") ? "" : "none";
    this.toggleDisplay = (this.toggleDisplay) ? false : true;
  }


  processSingleContactData(contact: any): any {
    const lastContactDate = contact.lastContacted ? new Date(contact.lastContacted) : (contact.dateAdded ? new Date(contact.dateAdded.seconds * 1000) : new Date());
    return {
      name: `${contact.firstName} ${contact.lastName}`,
      lastContacted: lastContactDate
    };
  }




  createSingleContactTimelineChart(contactData: any): void {
    const canvas = this.lastContactTimelineChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      this.lastContactTimelineChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [contactData.name], // Now expects a single name
          datasets: [{
            label: 'Days since last contact',
            data: [Math.floor((new Date().getTime() - contactData.lastContacted.getTime()) / (1000 * 60 * 60 * 24))], // Now expects a single value
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y',
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                callback: function (value) {
                  return value + ' day' + (value !== 1 ? 's' : ''); // Append 'day' or 'days' correctly
                }
              }
            }
          },
          responsive: true,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: 'Days Since Last Contact'
            }
          }
        }
      });
    } else {
      console.error('Failed to get canvas context for Last Contact Timeline Chart');
    }
  }

  // Function to fetch and process communication frequency for a single contact
  loadAndProcessSingleContactFrequency(contactId: string, periodStartDate: Date): void {
    this.dataService.getCollectionData('COMMUNICATIONS')
      .then(communicationsData => {
        this.logger.info("Loaded communications data:", communicationsData);
        const communicationFrequencyData = this.processSingleContactFrequency(contactId, communicationsData as Communication[], periodStartDate);

        if (communicationFrequencyData) {
          setTimeout(() => this.createSingleContactFrequencyChart(communicationFrequencyData), 0);
        }
      })
      .catch(err => {
        console.error("Failed to load communications:", err);
        // If there's an error, handle it by using an empty array and proceeding
        const communicationFrequencyData = this.processSingleContactFrequency(contactId, [] as Communication[], periodStartDate);
        if (communicationFrequencyData) {
          setTimeout(() => this.createSingleContactFrequencyChart(communicationFrequencyData), 0);
        }
      });
  }

  // The rest of your code remains the same


  // Function to process communication frequency for a single contact
  processSingleContactFrequency(contactId: string, communications: Communication[], periodStartDate: Date): any {
    const periodStart = periodStartDate.getTime();
    let frequency = 0;

    communications.forEach(communication => {
      if (communication.contactId === contactId && new Date(communication.date).getTime() >= periodStart) {
        frequency++;
      }
    });

    return {
      contactId: contactId,
      frequency: frequency
    };
  }



  // Function to create the chart for a single contact's communication frequency
  createSingleContactFrequencyChart(data: any): void {
    const canvas = this.communicationFrequencyChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      this.communicationFrequencyChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Communication Frequency'],
          datasets: [{
            label: `Communications for ${data.contactId}`,
            data: [data.frequency],
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0 // Ensures that the scale only includes whole numbers
              }
            },
            x: {
              beginAtZero: true,
            }
          },
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            },
            title: {
              display: true,
              text: `Communication Frequency for Last 30 Days`
            }
          }
        }
      });
    } else {
      console.error('Failed to get canvas context for Communication Frequency Chart');
    }
  }


}
