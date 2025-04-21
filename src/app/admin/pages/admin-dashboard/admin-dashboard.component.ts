import { Component, OnInit } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { NgxChartsModule } from '@swimlane/ngx-charts'; // Ensure NgxChartsModule is imported
import { Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-admin-dashboard',
  imports: [NgxChartsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  // 📊 Tax Filing Status (Pie Chart) Data
  taxFilingStatus: any[] = [];

  // 📊 Pending Tax Reports (Bar Chart) Data
  pendingTaxReports: any[] = [];

  // 📊 Color Scheme for Charts
  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#4CAF50',  '#FFC107','#FF5733', '#2196F3', '#E91E63'],
  };

  constructor(private firestore: Firestore) {}

  ngOnInit() {
    this.fetchTaxFilings();
  }

  // Fetch tax filings data from Firestore
  async fetchTaxFilings() {
    const taxFilingsRef = collection(this.firestore, 'taxFilings');  // Adjust the collection name if necessary
    const snapshot = await getDocs(taxFilingsRef);

    if (snapshot.empty) {
      console.log('No tax filings found');
      return;
    }

    const filings = snapshot.docs.map(doc => doc.data());

    // Calculate and categorize the tax filing status
    this.taxFilingStatus = [
      { name: 'Approved', value: this.countByStatus(filings, 'Approved') },
      { name: 'Pending', value: this.countByStatus(filings, 'Pending') },
      { name: 'Rejected', value: this.countByStatus(filings, 'Rejected') },
      { name: 'In Progress', value: this.countByStatus(filings, 'In Progress') },
    ];

    // Calculate pending tax reports (example of a category like "Business Tax", "Income Tax")
    this.pendingTaxReports = this.getPendingTaxReports(filings);
  }

  // Helper function to count filings by their status
  countByStatus(filings: any[], status: string): number {
    return filings.filter(filing => filing.status === status).length;
  }

  // Helper function to get pending tax reports categorized (e.g., "Business Tax", "Income Tax")
  getPendingTaxReports(filings: any[]): any[] {
    const categories = ['Business Tax', 'Income Tax', 'Property Tax'];
    const reportCounts = categories.map(category => {
      return {
        name: category,
        value: filings.filter(filing => filing.category === category && filing.status === 'Pending').length
      };
    });

    return reportCounts;
  }

  // Getter for total tax filings
  get totalTaxFilings(): number {
    return this.taxFilingStatus.reduce((acc, curr) => acc + curr.value, 0);
  }

  // Getter for pending filings count
  get pendingTaxFilings(): number {
    return this.taxFilingStatus.find(status => status.name === 'Pending')?.value || 0;
  }
}
