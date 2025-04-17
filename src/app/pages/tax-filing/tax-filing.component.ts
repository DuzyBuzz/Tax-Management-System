import { Component, OnInit } from '@angular/core';
import { Firestore, collection, getDocs, deleteDoc, doc } from '@angular/fire/firestore';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-tax-filing',
  standalone: false,
  templateUrl: './tax-filing.component.html',
  styleUrls: ['./tax-filing.component.scss'],
})
export class TaxFilingComponent implements OnInit {
  taxFilings: any[] = [];
  showDeleteConfirmation = false;
  uid: string | null = null;
  showModal = false;

  constructor(private firestore: Firestore, private authService: AuthService) {}

  ngOnInit(): void {
    this.getCurrentUserId();
  }

  async getCurrentUserId() {
    this.uid = await this.authService.getCurrentUserId();
    if (this.uid) {
      this.fetchTaxFilings(this.uid);
    }
  }

  openModal() {
    // Open modal for filing new tax declaration request
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  openDeleteConfirmation() {
    this.showDeleteConfirmation = true;
  }

  closeDeleteConfirmation() {
    this.showDeleteConfirmation = false;
  }

  async fetchTaxFilings(uid: string) {
    const filingsRef = collection(this.firestore, 'taxFilings');
    const snapshot = await getDocs(filingsRef);
    this.taxFilings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async deleteAllFilings() {
    const filingsRef = collection(this.firestore, 'taxFilings');
    const snapshot = await getDocs(filingsRef);

    try {
      for (const docSnapshot of snapshot.docs) {
        const filingRef = doc(this.firestore, 'taxFilings', docSnapshot.id);
        await deleteDoc(filingRef);
      }
      this.taxFilings = [];  // Clear the local list after deletion
      this.closeDeleteConfirmation();
      alert('All tax filings have been deleted successfully!');
    } catch (error) {
      console.error('Error deleting filings: ', error);
      alert('Failed to delete the tax filings. Please try again later.');
    }
  }

  confirmDelete(filingId: string) {
    // Trigger the modal to confirm deletion of a single filing
    if (confirm('Are you sure you want to delete this tax filing?')) {
      this.deleteFiling(filingId);
    }
  }

  async deleteFiling(filingId: string) {
    try {
      const filingRef = doc(this.firestore, 'taxFilings', filingId);
      await deleteDoc(filingRef);
      this.taxFilings = this.taxFilings.filter(filing => filing.id !== filingId);
      alert('Tax filing deleted successfully!');
    } catch (error) {
      console.error('Error deleting filing: ', error);
      alert('Failed to delete the filing. Please try again later.');
    }
  }
}
