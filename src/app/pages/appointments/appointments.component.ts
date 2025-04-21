import { Component, OnInit } from '@angular/core';
import { collection, Firestore, getDocs } from '@angular/fire/firestore';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { query, where } from '@angular/fire/firestore';
import { AuthService } from '../../auth/auth.service';




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


  constructor(private firestore: Firestore, private authService: AuthService ) {}
  ngOnInit(): void {
    this.setCalendarEvents();
    this.fetchTaxFilings();
  }
    // Fetch tax filings from Firestore
    async fetchTaxFilings(): Promise<void> {
      try {
        // Step 1: Get current user UID
        const uid = await this.authService.getCurrentUserId();
        if (!uid) {
          console.error('User is not logged in');
          return;
        }

        // Step 2: Reference the "taxFilings" collection and filter by userUid
        const taxFilingsRef = collection(this.firestore, 'taxFilings');
        const userQuery = query(taxFilingsRef, where('userUid', '==', uid));

        // Step 3: Get the filtered documents
        const querySnapshot = await getDocs(userQuery);

        // Step 4: Map the results to the local array
        this.taxFilings = querySnapshot.docs.map((doc) => {
          const data = doc.data() as TaxFiling;
          return { ...data, id: doc.id };
        });

        // Step 5: Calculate deadlines & update the calendar
        this.computeDeadlines();       // Optional - only if you use deadlines/renewalStatus
        this.setCalendarEvents();     // Refresh the calendar view

      } catch (error) {
        console.error('Error fetching tax filings: ', error);
      }
    }
// Computes deadline and renewalStatus for each tax filing
computeDeadlines(): void {
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
