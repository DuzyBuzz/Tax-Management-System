import { Component, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-admin-dashboard',
  imports: [FullCalendarModule, NgxChartsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
 // ✅ Calendar Configuration
 calendarOptions: CalendarOptions = {
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  events: [
    { title: 'Income Tax Deadline', date: '2025-04-15', color: 'red' },
    { title: 'Business Tax Due', date: '2025-05-01', color: 'blue' },
    { title: 'Property Tax Submission', date: '2025-06-10', color: 'green' },
  ],
};

// ✅ Hardcoded Tax Filing Status Data (Pie Chart)
taxFilingStatus: any[] = [
  { name: 'Completed', value: 120 },
  { name: 'Pending', value: 30 },
  { name: 'Rejected', value: 5 },
  { name: 'In Progress', value: 15 },
];

// ✅ Hardcoded Pending Tax Reports Data (Bar Chart)
pendingTaxReports: any[] = [
  { name: 'Business Tax', value: 10 },
  { name: 'Income Tax', value: 5 },
  { name: 'Property Tax', value: 3 },
];

colorScheme: Color = {
  name: 'custom',
  selectable: true,
  group: ScaleType.Ordinal,
  domain: ['#4CAF50', '#FF5733', '#FFC107', '#2196F3', '#E91E63'],
};

constructor() {}

ngOnInit() {
  // Optionally, any other initialization logic can go here
}

// Getter for the total tax filings
get totalTaxFilings(): number {
  return this.taxFilingStatus.reduce((acc, curr) => acc + curr.value, 0);
}

// Getter for pending filings count
get pendingTaxFilings(): number {
  return this.taxFilingStatus.find(status => status.name === 'Pending')?.value || 0;
}
}
