import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';

@Component({
  imports: [CommonModule, ],
  selector: 'app-successful-transactions',
  templateUrl: './successful-transactions.component.html',
  styleUrls: ['./successful-transactions.component.scss']
})
export class SuccessfulTransactionsComponent implements OnInit {
  transactions: any[] = [];
  loading = true;

  constructor(private firestore: Firestore) {}

  async ngOnInit() {
    const filingsRef = collection(this.firestore, 'tax_filings');
    const snapshot = await getDocs(filingsRef);
    this.transactions = snapshot.docs
      .map(doc => ({ id: doc.id, ...(doc.data() as { status: string }) }))
      .filter(filing => filing.status === 'Received');
    this.loading = false;
  }

  printReport() {
    const printContents = document.getElementById('print-section')?.innerHTML;
    if (printContents) {
      const printWindow = window.open('', '', 'height=600,width=900');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Successful Transactions Report</title>');
        printWindow.document.write('<style>body{font-family:sans-serif;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ccc;padding:4px;} th{background:#d1fae5;}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write('<h2>Successful Transactions Report</h2>');
        printWindow.document.write(printContents);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  }
}
