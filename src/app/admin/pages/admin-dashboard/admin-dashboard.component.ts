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

  // Additional properties
  successfulTransactions = 0;
  declinedFilings = 0;
  filingsOverTime: any[] = [];
  topTaxpayers: any[] = [];
  recentActivities: { date: Date, description: string }[] = [];

  activitiesAnalytics: any[] = [];

  // Add this property
  pendingPaymentSentReports: any[] = [];

  // Add this property
  pendingPaymentSentCount = 0;

  // Add this property
  typeOfApplicationAnalytics: any[] = [];

  barangayAnalytics: any[] = [];

  // Add this property
  totalUniqueBarangays = 0;

  constructor(private firestore: Firestore) {}

  ngOnInit() {
    this.fetchTaxFilings();
  }

  // Fetch tax filings data from Firestore
  async fetchTaxFilings() {
    const taxFilingsRef = collection(this.firestore, 'tax_filings');
    const snapshot = await getDocs(taxFilingsRef);

    if (snapshot.empty) {
      this.filingsOverTime = [];
      return;
    }

    const filings = snapshot.docs.map(doc => doc.data());

    // Pie chart data
this.taxFilingStatus = [
  {
    name: 'Successful Transactions',
    value: filings.filter(f => f['status'] === 'Received' || f['status'] === 'Approved').length
  },
  {
    name: 'Pending (Payment Sent)',
    value: filings.filter(f => f['status'] === 'Payment Sent').length
  },
  {
    name: 'Declined Filings',
    value: filings.filter(f => f['status'] === 'Declined' || f['status'] === 'Rejected').length
  }
];

    // Bar chart data
    this.pendingTaxReports = this.getPendingTaxReports(filings);

    // Successful transactions
    this.successfulTransactions = filings.filter(f => f['status'] === 'Received' || f['status'] === 'Approved').length;

    // Declined filings
    this.declinedFilings = filings.filter(f => f['status'] === 'Declined' || f['status'] === 'Rejected').length;

    // --- Filings Over Time ---
    const filingsByDate: { [date: string]: number } = {};
    filings.forEach(f => {
      // Use addressDateAssessed, createdAt, or fallback to today
      let date: any = f['addressDateAssessed'] || f['createdAt'];
      if (date && typeof date.toDate === 'function') {
        date = date.toDate();
      } else if (typeof date === 'string') {
        date = new Date(date);
      } else if (!date) {
        date = new Date();
      }
      const dateStr = date.toISOString().split('T')[0];
      filingsByDate[dateStr] = (filingsByDate[dateStr] || 0) + 1;
    });

    this.filingsOverTime = Object.keys(filingsByDate)
      .sort()
      .map(date => ({
        name: date,
        value: filingsByDate[date]
      }));

    // Top taxpayers (by grandTotal)
    const taxpayerMap: { [key: string]: { businessName: string, ownerName: string, totalPaid: number } } = {};
    filings.forEach(f => {
      if (f['status'] === 'Received' || f['status'] === 'Approved') {
        const key = (f['businessName'] || '') + (f['ownerName'] || '');
        if (!taxpayerMap[key]) {
          taxpayerMap[key] = {
            businessName: f['businessName'] || '',
            ownerName: f['ownerName'] || '',
            totalPaid: 0
          };
        }
        taxpayerMap[key].totalPaid += Number(f['grandTotal'] || 0);
      }
    });
    this.topTaxpayers = Object.values(taxpayerMap)
      .sort((a, b) => b.totalPaid - a.totalPaid)
      .slice(0, 5);

    // Recent activities (last 10 filings)
    this.recentActivities = filings
      .sort((a, b) => {
        const dateA = a['addressDateAssessed'] || a['createdAt'];
        const dateB = b['addressDateAssessed'] || b['createdAt'];
        return (new Date(dateB)).getTime() - (new Date(dateA)).getTime();
      })
      .slice(0, 10)
      .map(f => ({
        date: f['addressDateAssessed'] || f['createdAt'] ? new Date(f['addressDateAssessed'] || f['createdAt']) : new Date(),
        description: `${f['ownerName']} filed for ${f['businessName']} (${f['status']})`
      }));

    // Compute activities analytics
    this.computeActivitiesAnalytics(filings);

    // Add this line
    this.pendingPaymentSentReports = this.getPendingPaymentSentReports(filings);

    // After fetching filings
    this.pendingPaymentSentCount = filings.filter(f => f['status'] === 'Payment Sent').length;

    // Compute type of application analytics
    this.computeTypeOfApplicationAnalytics(filings);

    // Group filings by month and year
    const filingsByMonth: { [month: string]: number } = {};
    filings.forEach(f => {
      let date: any = f['addressDateAssessed'] || f['createdAt'];
      if (date && typeof date.toDate === 'function') {
        date = date.toDate();
      } else if (typeof date === 'string') {
        date = new Date(date);
      } else if (!date) {
        date = new Date();
      }
      // Format: "MMM yyyy" (e.g., "May 2024")
      const monthStr = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      filingsByMonth[monthStr] = (filingsByMonth[monthStr] || 0) + 1;
    });
    this.filingsOverTime = Object.keys(filingsByMonth)
      .sort((a, b) => {
        // Sort by date
        const [aMonth, aYear] = a.split(' ');
        const [bMonth, bYear] = b.split(' ');
        return new Date(`${aMonth} 1, ${aYear}`).getTime() - new Date(`${bMonth} 1, ${bYear}`).getTime();
      })
      .map(month => ({
        name: month,
        value: filingsByMonth[month]
      }));

    // After fetching filings in fetchTaxFilings()
    const uniqueBarangays = new Set(filings.map(f => f['barangay']).filter(b => !!b));
this.totalUniqueBarangays = uniqueBarangays.size;
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

  // Add this method
  getPendingPaymentSentReports(filings: any[]): any[] {
    const categories = ['Business Tax', 'Income Tax', 'Property Tax'];
    return categories.map(category => ({
      name: category,
      value: filings.filter(f => f.category === category && f.status === 'Payment Sent').length
    }));
  }

  // Compute activities analytics
  computeActivitiesAnalytics(filings: any[]) {
    const activityMap: { [key: string]: number } = {};
    filings.forEach(filing => {
      (filing.activities || []).forEach((activity: any) => {
        const name = activity.activityName || activity.activity || 'Unknown';
        activityMap[name] = (activityMap[name] || 0) + Number(activity.capitalInvestment || 0);
      });
    });
    this.activitiesAnalytics = Object.keys(activityMap).map(name => ({
      name,
      value: activityMap[name]
    }));
  }

  // Compute type of application analytics
  computeTypeOfApplicationAnalytics(filings: any[]) {
    const map: { [key: string]: number } = {};
    filings.forEach(f => {
      const type = f.typeOfApplication || 'Unknown';
      map[type] = (map[type] || 0) + 1;
    });
    this.typeOfApplicationAnalytics = Object.keys(map).map(type => ({
      name: type,
      value: map[type]
    }));
  }

  // Compute barangay analytics
  computeBarangayAnalytics(filings: any[]) {
    const barangayMap: { [key: string]: number } = {};
    filings.forEach(f => {
      const barangay = f.barangay || 'Unknown';
      barangayMap[barangay] = (barangayMap[barangay] || 0) + 1;
    });
    this.barangayAnalytics = Object.keys(barangayMap).map(name => ({
      name,
      value: barangayMap[name]
    }));
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
