import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';

import { Chart, registerables } from 'chart.js';
import { Contact, Interaction, ConnectionDetail, Engagement, Communication } from '../../../shared/data/interfaces/contact.model';
import { ReadComponent } from '../read/read.component';
import { ContactService } from '../../../services/contact.service';
import { DataService } from '../../../services/data.service';
import { LoggerService } from '../../../services/logger.service';
import { ContactCard1Component } from '../../../shared/page/contact-card-1/contact-card-1.component';
import { ContactCard3Component } from '../../../shared/page/contact-card-3/contact-card-3.component';
import { WeeklyCalendarComponent } from '../../../shared/page/weekly-calendar/weekly-calendar.component';
import { BehaviorSubject } from 'rxjs';

// Register Chart.js components
Chart.register(...registerables);

@Component({

  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, ReadComponent, ContactCard1Component, ContactCard3Component, WeeklyCalendarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  @ViewChild('queryInput') queryInput!: ElementRef<HTMLInputElement>;

  suggestedContact!: Contact;

  @ViewChild('contactsOverTimeChart') private contactsOverTimeChartRef!: ElementRef<HTMLCanvasElement>;
  contactsOverTimeChart!: Chart;


  @ViewChild('contactsByTypeChart') private contactsByTypeChartRef!: ElementRef<HTMLCanvasElement>;
  contactsByTypeChart!: Chart<"pie", number[], string>;

  @ViewChild('timezonesChart') private timezonesChartRef!: ElementRef<HTMLCanvasElement>;
  timezonesChart!: Chart;

  @ViewChild('networkHealthChart') private networkHealthChartRef!: ElementRef<HTMLCanvasElement>;
  networkHealthChart!: Chart;

  @ViewChild('lastContactTimelineChart') private lastContactTimelineChartRef!: ElementRef<HTMLCanvasElement>;
  lastContactTimelineChart!: Chart;

  @ViewChild('communicationFrequencyChart') private communicationFrequencyChartRef!: ElementRef<HTMLCanvasElement>;
  communicationFrequencyChart!: Chart;

  @ViewChild('acquisitionSourceChart') private acquisitionSourceChartRef!: ElementRef<HTMLCanvasElement>;
  acquisitionSourceChart!: Chart;

  @ViewChild('professionChart') private professionChartRef!: ElementRef<HTMLCanvasElement>;
  professionChart!: Chart<"pie", number[], string>;

  @ViewChild('genderChart') private genderChartRef!: ElementRef<HTMLCanvasElement>;
  genderChart!: Chart<"pie", number[], string>;

  @ViewChild('responseTimeChart') private responseTimeChartRef!: ElementRef<HTMLCanvasElement>;
  responseTimeChart!: Chart;


  @ViewChild('priorityContactsChart') private priorityContactsChartRef!: ElementRef<HTMLCanvasElement>;
  priorityContactsChart!: Chart;

  priorityContactsChartData!: any;
  month!: any;
  weeklyChartData = new BehaviorSubject<any[]>([]);


  private chartData: any[] = [];

  constructor(private router: Router, private contactService: ContactService, private dataService: DataService, private logger: LoggerService) { }



  ngOnInit(): void {

    const periodStartDate = new Date();
    periodStartDate.setDate(periodStartDate.getDate() - 30);

    this.dataService.getCollectionData('CONTACTS').then(data => {
      if (data && data.length > 0) {
        const contacts: Contact[] = data as Contact[];
        this.suggestedContact = contacts[0];
        // Process data for the bar chart
        this.chartData = this.processData(data);
        // Initialize the bar chart if data is available
        if (this.chartData.length > 0) {
          setTimeout(() => {
            this.createBarChart(this.chartData);
          }, 0);
        }

        // Process data for the pie chart
        const pieChartData = this.processProfileTypes(data);
        // Initialize the pie chart if data is available
        if (pieChartData.length > 0) {
          setTimeout(() => {
            this.createProfileTypeChart(pieChartData);
          }, 0);
        }

        // Process Time Zone Data
        const timezoneData = this.processTimezoneData(data);
        if (timezoneData.length > 0) {
          setTimeout(() => {
            this.createTimezoneChart(timezoneData);
          }, 0);
        }

        const healthScoreData = this.processNetworkHealthData(this.generateRandomSample(data));
        if (healthScoreData.length > 0) {
          setTimeout(() => {
            this.createNetworkHealthChart(healthScoreData);
          }, 0);
        }


        const lastContactData = this.processLastContactData(data);
        if (lastContactData.length > 0) {
          setTimeout(() => {
            this.createLastContactTimelineChart(lastContactData);
          }, 0);
        }


        const acquisitionSourceData = this.processContactAcquisitionData(data);
        if (acquisitionSourceData.length > 0) {
          setTimeout(() => {
            this.createAcquisitionSourceChart(acquisitionSourceData);
          }, 0);
        }


        const genderChartData = this.processGenderData(data);
        if (genderChartData.length > 0) {
          setTimeout(() => {
            this.createGenderChart(genderChartData);
          }, 0);
        }

        const professionChartData = this.processProfessionData(data);
        if (professionChartData.length > 0) {
          setTimeout(() => {
            this.logger.info("professionChartData", data)
            this.createProfessionChart(professionChartData);
          }, 0);
        }



        this.dataService.getCollectionData('COMMUNICATIONS').catch(err => {
          console.error("Failed to load communications:", err);
          return [] as Communication[];  // Ensure this matches the expected type in then()
        }).then(communicationsData => {
          this.logger.info("getCollectionData('COMMUNICATIONS')", communicationsData)
          // TypeScript should now understand that communicationsData is always Communication[]
          communicationsData = communicationsData as Communication[]; // This assertion may now be redundant
          const communicationFrequencyData = this.processCommunicationFrequency(data, communicationsData, periodStartDate);


          if (communicationFrequencyData.length > 0) {
            setTimeout(() => this.createCommunicationFrequencyChart(communicationFrequencyData), 0);
          }

         this.priorityContactsChartData = this.processContactPriorities(data, communicationsData);
          
          if (this.priorityContactsChartData.length > 0) {
            console.log("Data for chart:", data);
            setTimeout(() => this.createPriorityContactsChart(this.priorityContactsChartData), 0);
            this.weeklyChartData.next(this.priorityContactsChartData); 
          }
        })

      }
    }).catch(error => {
      this.logger.error("Failed to load contact data:", error);
      this.createBarChart([]); // Handle bar chart errors gracefully
      this.createProfileTypeChart([]); // Handle pie chart errors gracefully
      this.createTimezoneChart([]);
      this.createNetworkHealthChart([]);
      this.createLastContactTimelineChart([]);
      this.createCommunicationFrequencyChart([]);
      this.createAcquisitionSourceChart([]);
      this.createProfessionChart([]);
      this.createGenderChart([]);
    });
  }

  submitQuery(): void {

    try {
      const query = this.queryInput.nativeElement.value.trim();  // Use trim() to remove any leading or trailing whitespace
      this.logger.log('Submitting query:', query);
      if (!query) {  // Check if the query is empty
        this.router.navigate(['/contact-list']);
      } else {
        // Here, you can add logic to handle when there is a query entered.
        this.logger.log('Query provided:', query);
      }

    } catch (error) {
      this.router.navigate(['/contact-list']);
    }

  }

  navigateToEditContact(): void {
    this.contactService.resetContact();
    this.router.navigate(['/contact-edit']);
  }

  navigateToImport(): void {
    this.router.navigate(['/contact-import']);
  }


  processData(contacts: any[]): any {
    this.logger.log("Received contacts:", contacts);
    const dateCounts = new Map();
    contacts.forEach(contact => {
      // Check if the dateAdded field and its seconds property exist before proceeding
      if (contact.dateAdded && contact.dateAdded.seconds) {
        const date = new Date(contact.dateAdded.seconds * 1000);
        const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        dateCounts.set(formattedDate, (dateCounts.get(formattedDate) || 0) + 1);
      } else {
        // Log an error or handle the case where dateAdded is missing
        this.logger.error('Missing or invalid dateAdded field for contact:', contact);
      }
    });
    this.logger.log("Date counts:", Array.from(dateCounts.entries()));
    return Array.from(dateCounts, ([date, count]) => ({ date, count }));
  }

  processProfileTypes(contacts: any[]): any {
    const typeCounts = new Map();
    contacts.forEach(contact => {
      contact.profileTypes.forEach((type: string) => {
        if (typeCounts.has(type)) {
          typeCounts.set(type, typeCounts.get(type) + 1);
        } else {
          typeCounts.set(type, 1);
        }
      });
    });
    console.log("Profile Type Counts:", Array.from(typeCounts.entries())); // For debugging
    return Array.from(typeCounts, ([type, count]) => ({ type, count }));
  }

  processTimezoneData(contacts: any[]): any {
    const timezoneCounts = new Map();
    contacts.forEach(contact => {
      const timezone = contact.timezone;
      if (timezoneCounts.has(timezone)) {
        timezoneCounts.set(timezone, timezoneCounts.get(timezone) + 1);
      } else {
        timezoneCounts.set(timezone, 1);
      }
    });
    return Array.from(timezoneCounts, ([timezone, count]) => ({ timezone, count }));
  }




  createBarChart(data: any[]): void {
    this.logger.log("createBarChart Chart data:", data);
    const canvas = this.contactsOverTimeChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      this.contactsOverTimeChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(d => d.date),
          datasets: [{
            label: 'Contacts Added',
            data: data.map(d => d.count),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          },
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Contacts Added Over Time'
            }
          }
        }
      });
    } else {
      this.logger.error('Failed to get canvas context');
    }
  }

  createProfileTypeChart(data: any[]): void {
    const canvas = this.contactsByTypeChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      this.contactsByTypeChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: data.map(d => d.type),
          datasets: [{
            label: 'Contacts by Type',
            data: data.map(d => d.count),
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              // Add more colors as needed
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              // Add more borders as needed
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Contacts by Type'
            }
          }
        }
      });
    } else {
      console.error('Failed to get canvas context');
    }
  }

  createTimezoneChart(data: any[]): void {
    const canvas = this.timezonesChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      this.timezonesChart = new Chart(ctx, {
        type: 'bar',  // You can also consider using 'pie' for visual variety
        data: {
          labels: data.map(d => d.timezone),
          datasets: [{
            label: 'Contacts by US Timezone',
            data: data.map(d => d.count),
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              // add more colors for each timezone
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              // add more border colors corresponding to backgroundColors
            ],
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          },
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Contacts by US Timezones'
            }
          }
        }
      });
    } else {
      console.error('Failed to get canvas context');
    }
  }

  processNetworkHealthData(contacts: any[]): any {
    return contacts.map(contact => {
      let score = 0;
      let factors = 0;

      if (contact.interactions) {
        score += this.calculateInteractionScore(contact.interactions);
        factors++;
      }

      if (contact.engagements) {
        score += this.calculateEngagementScore(contact.engagements);
        factors++;
      }

      if (contact.connectionDetails) {
        score += this.calculateConnectionDetailScore(contact.connectionDetails);
        factors++;
      }

      // Only average the score if one or more factors were actually calculated
      return {
        name: `${contact.firstName} ${contact.lastName}`,
        score: factors > 0 ? score / factors : 0
      };
    });
  }

  calculateInteractionScore(interactions: Interaction[]): number {
    // Implement logic based on interaction frequency, type, etc.
    return interactions.length; // Simple example: score by number of interactions
  }

  calculateEngagementScore(engagements: Engagement[]): number {
    // Implement logic based on response time, outcome, etc.
    return engagements.reduce((total, next) => total + next.engagementLevel, 0) / engagements.length;
  }

  calculateConnectionDetailScore(details: ConnectionDetail): number {
    // Implement logic based on mutual connections, transaction history, etc.
    let score = 0;
    score += details.mutualConnections;
    score += details.transactionHistory.length; // Simple example
    return score;
  }

  createNetworkHealthChart(data: any[]): void {
    const canvas = this.networkHealthChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      this.networkHealthChart = new Chart(ctx, {
        type: 'bar', // or 'line', 'radar', etc., depending on your preference
        data: {
          labels: data.map(d => d.name),
          datasets: [{
            label: 'Network Strength Score',
            data: data.map(d => d.score),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              max: 10 // Assuming scores are normalized to a max of 10
            }
          },
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Network Strength Score'
            }
          }
        }
      });
    } else {
      console.error('Failed to get canvas context for Network Strenth Chart');
    }
  }

  generateRandomSample(contacts: any[], sampleSize: number = 15): any[] {
    const shuffled = contacts.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, sampleSize);
  }



  processLastContactData(contacts: any[]): any {
    return contacts.map(contact => {
      const lastContactDate = contact.lastContacted ? new Date(contact.lastContacted) : (contact.dateAdded ? new Date(contact.dateAdded.seconds * 1000) : new Date());
      return {
        name: `${contact.firstName} ${contact.lastName}`,
        lastContacted: lastContactDate
      };
    }).sort((a, b) => b.lastContacted.getTime() - a.lastContacted.getTime()) // Sort by most recently contacted
      .slice(0, 25); // Take only the top 25
  }



  createLastContactTimelineChart(data: any[]): void {
    const canvas = this.lastContactTimelineChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      this.lastContactTimelineChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(d => d.name),
          datasets: [{
            label: 'Days since last contact',
            data: data.map(d => {
              const today = new Date();
              const lastContacted = d.lastContacted;
              const timeDiff = today.getTime() - lastContacted.getTime();
              return Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // Converts time difference to days
            }),
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


  processCommunicationFrequency(contacts: any[], communications: Communication[], periodStartDate: Date): any[] {
    const periodStart = periodStartDate.getTime();
    // Explicitly typing the object to avoid TypeScript errors
    const communicationCounts: Record<string, number> = {}; // A map from contactId to count

    communications.forEach(communication => {
      if (new Date(communication.date).getTime() >= periodStart) {
        if (communicationCounts[communication.contactId]) {
          communicationCounts[communication.contactId]++;
        } else {
          communicationCounts[communication.contactId] = 1;
        }
      }
    });

    // Map the counts to the contacts
    return contacts.map(contact => ({
      name: `${contact.firstName} ${contact.lastName}`,
      frequency: communicationCounts[contact.id] || 0 // Use || 0 to handle undefined cases
    }));
  }


  createCommunicationFrequencyChart(data: any[]): void {
    const canvas = this.communicationFrequencyChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      this.communicationFrequencyChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(d => d.name),
          datasets: [{
            label: 'Communication Frequency',
            data: data.map(d => d.frequency),
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
              text: 'Communication Frequency Over Specified Period'
            }
          }
        }
      });
    } else {
      console.error('Failed to get canvas context for Communication Frequency Chart');
    }
  }



  processContactAcquisitionData(contacts: any[]): any {
    let sourceCounts: Record<string, number> = {};

    contacts.forEach(contact => {
      let source = contact.acquisitionSource || 'Unknown';  // Default to 'Unknown' if not specified
      if (sourceCounts[source]) {
        sourceCounts[source]++;
      } else {
        sourceCounts[source] = 1;
      }
    });

    return Object.keys(sourceCounts).map(key => ({
      source: key,
      count: sourceCounts[key]
    }));
  }

  createAcquisitionSourceChart(data: any[]): void {
    const canvas = this.acquisitionSourceChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      this.acquisitionSourceChart = new Chart(ctx, {
        type: 'bar',  // Using a bar chart for consistency
        data: {
          labels: data.map(d => d.source),  // The sources of acquisition
          datasets: [{
            label: 'Contact Acquisition Sources',
            data: data.map(d => d.count),  // The count of contacts per source
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              // More colors as needed
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              // More borders as needed
            ],
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0  // Ensures that the scale only includes whole numbers
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
              text: 'Contact Acquisition Sources'
            }
          }
        }
      });
    } else {
      console.error('Failed to get canvas context for Acquisition Source Chart');
    }
  }

  processProfessionData(contacts: any[]): any {
    const professionCounts = new Map();

    contacts.forEach(contact => {
      const profession = contact.profession || 'Unknown'; // Handle undefined professions
      if (professionCounts.has(profession)) {
        professionCounts.set(profession, professionCounts.get(profession) + 1);
      } else {
        professionCounts.set(profession, 1);
      }
    });

    console.log("Profession Counts:", Array.from(professionCounts.entries())); // For debugging
    return Array.from(professionCounts, ([profession, count]) => ({ profession, count }));
  }

  processGenderData(contacts: any[]): any {
    const genderCounts = new Map();

    contacts.forEach(contact => {
      const gender = contact.gender || 'Unknown'; // Handle undefined genders
      if (genderCounts.has(gender)) {
        genderCounts.set(gender, genderCounts.get(gender) + 1);
      } else {
        genderCounts.set(gender, 1);
      }
    });

    console.log("Gender Counts:", Array.from(genderCounts.entries())); // For debugging
    return Array.from(genderCounts, ([gender, count]) => ({ gender, count }));
  }





  createProfessionChart(data: any[]): void {
    const canvas = this.professionChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      this.professionChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: data.map(d => d.profession),
          datasets: [{
            label: 'Contacts by Profession',
            data: data.map(d => d.count),
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              // Add more colors as needed
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              // Add more borders as needed
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Contact Breakdown by Profession'
            }
          }
        }
      });
    } else {
      console.error('Failed to get canvas context');
    }
  }



  createGenderChart(data: any[]): void {
    const canvas = this.genderChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      this.genderChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: data.map(d => d.gender),
          datasets: [{
            label: 'Contacts by Gender',
            data: data.map(d => d.count),
            backgroundColor: [
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 99, 132, 0.2)',
              // Additional colors
            ],
            borderColor: [
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(255, 99, 132, 1)',
              // Additional borders
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Contact Breakdown by Gender'
            }
          }
        }
      });
    } else {
      console.error('Failed to get canvas context');
    }
  }


  processContactPriorities(contacts: any[], communications: any[]): any {
    const today = new Date();
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);

    // Create a map to hold dates and their associated contacts
    const datesWithContacts = new Map();

    // Initialize each day with an empty array
    for (let day = 0; day < 7; day++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + day);
      const formattedDate = `${futureDate.getFullYear()}-${futureDate.getMonth() + 1}-${futureDate.getDate()}`;
      datesWithContacts.set(formattedDate, []);  // Ensure it's always an array
  }

    // Map to keep track of last communication date for each contact
    const lastCommunicationDates = new Map();
    communications.forEach(communication => {
      const contactDate = new Date(communication.date);
      const contactId = communication.contactId;
      // Update the latest communication date
      if (!lastCommunicationDates.has(contactId) || lastCommunicationDates.get(contactId) < contactDate) {
        lastCommunicationDates.set(contactId, contactDate);
      }
    });

    // Sort contacts by their communication urgency
    contacts.forEach(contact => {
      if (!lastCommunicationDates.has(contact.id)) {
        // If no communication data, high priority
        this.assignContactToEarliestAvailableDate(datesWithContacts, contact);
      } else {
        const lastContactDate = lastCommunicationDates.get(contact.id);
        if (((today.getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24)) >= 7) {
          // Contact them again if it's been 7+ days
          this.assignContactToEarliestAvailableDate(datesWithContacts, contact);
        }
      }
    });

    return Array.from(datesWithContacts, ([date, contacts]) => ({ date, contacts: contacts.slice(0, 10) })); // Limit to 10 contacts per day
  }

  assignContactToEarliestAvailableDate(datesWithContacts: Map<string, any[]>, contact: any) {
    for (let [date, contacts] of datesWithContacts) {
      if (contacts.length < 10) {
        contacts.push(contact);
        break;
      }
    }
  }

  createPriorityContactsChart(data: any[]): void {
    this.logger.info("Beginniing createPriorityContactsChart ", data)
    const canvas = this.priorityContactsChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        this.priorityContactsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.date),
                datasets: [{
                    label: 'Planned Contact Count',
                    data: data.map(d => d.contacts ? d.contacts.length : 0),  // Ensuring contacts are defined
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
                            stepSize: 1  // Since we are counting contacts
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Contact Prioritization for Next 7 Days'
                    }
                }
            }
        });
    } else {
        console.error('Failed to get canvas context');
    }
}




}
