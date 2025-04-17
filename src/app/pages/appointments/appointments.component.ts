import { Component, OnInit } from '@angular/core';
import { collection, Firestore, getDocs } from '@angular/fire/firestore';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';

interface TaxFiling {
  businessName: string;
  businessId: string;
  forYear: number;
  status: 'Approved' | 'Pending' | 'Declined' | string;
  type?: 'Business' | 'Income' | 'Property'; // Optional field
  deadline?: string; // ISO string for deadline
  renewalStatus?: 'Upcoming' | 'Overdue' | 'Completed';
}

@Component({
  selector: 'app-appointments',
  standalone: false,
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss'],
})
export class AppointmentsComponent implements OnInit {
  calendarOptions: CalendarOptions = {};
  today = new Date();
  taxFilings: TaxFiling[] = [];


  constructor(private firestore: Firestore) {}
  ngOnInit(): void {
    this.setCalendarEvents();
    this.fetchTaxFilings();
  }
    // Fetch tax filings from Firestore
    async fetchTaxFilings(): Promise<void> {
      try {
        // Get reference to the taxFilings collection
        const taxFilingsRef = collection(this.firestore, 'taxFilings');

        // Get the documents from the collection
        const querySnapshot = await getDocs(taxFilingsRef);

        // Convert the documents to an array
        this.taxFilings = querySnapshot.docs.map((doc) => {
          const data = doc.data() as TaxFiling;
          // Optional: include the document ID if needed
          return { ...data, id: doc.id };
        });

        this.setCalendarEvents(); // Update calendar after fetching data
      } catch (error) {
        console.error('Error fetching tax filings: ', error);
      }
    }

  // Sample with deadlines and computed status
  initTaxFilings(): void {
    this.taxFilings = [
      {
        businessName: 'Acme Corp',
        businessId: 'ACME-001',
        forYear: 2025,
        status: 'Approved',
        type: 'Business',
      },
      {
        businessName: 'Global Tech Inc.',
        businessId: 'GTI-034',
        forYear: 2025,
        status: 'Pending',
        type: 'Income',
      },
      {
        businessName: 'Sunrise Cafe',
        businessId: 'SCF-125',
        forYear: 2024,
        status: 'Declined',
        type: 'Property',
      },
    ];

    // Compute deadlines & renewal status
    this.taxFilings.forEach((filing) => {
      const deadlineDate = this.getDeadlineDate(filing.forYear, filing.type || 'Business');
      filing.deadline = deadlineDate.toISOString().split('T')[0]; // Format to YYYY-MM-DD

      const today = new Date();
      if (today > deadlineDate && filing.status !== 'Approved') {
        filing.renewalStatus = 'Overdue';
      } else if (today < deadlineDate) {
        filing.renewalStatus = 'Upcoming';
      } else {
        filing.renewalStatus = 'Completed';
      }
    });
  }

  // Returns deadline based on type
  getDeadlineDate(forYear: number, type: string): Date {
    switch (type) {
      case 'Business':
        return new Date(`${forYear}-01-20`);
      case 'Income':
        return new Date(`${forYear}-04-15`);
      case 'Property':
        return new Date(`${forYear}-03-31`);
      default:
        return new Date(`${forYear}-01-01`);
    }
  }

  // Map tax filing deadlines to calendar
  setCalendarEvents(): void {
    this.calendarOptions = {
      plugins: [dayGridPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth',
      },
      events: this.taxFilings.map((filing) => ({
        title: `${filing.businessName} - ${filing.type} Tax`,
        start: filing.deadline,
        color: this.getEventColor(filing.type),
        description: `Deadline for ${filing.businessName}'s ${filing.type} tax renewal.`,
      })),
      eventClick: (info) => {
        alert(`📌 ${info.event.title}\n\n🗓 ${info.event.start?.toDateString()}\n📝 ${info.event.extendedProps['description']}`);
      },
    };
  }

  getEventColor(type?: string): string {
    switch (type) {
      case 'Income':
        return '#dc2626'; // red
      case 'Business':
        return '#2563eb'; // blue
      case 'Property':
        return '#16a34a'; // green
      default:
        return '#6b7280'; // gray
    }
  }
}
