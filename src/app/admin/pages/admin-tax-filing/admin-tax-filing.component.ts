import { Component, OnInit } from '@angular/core';
import { Firestore, collection, getDocs, deleteDoc, doc, updateDoc  } from '@angular/fire/firestore';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-admin-tax-filing',
  standalone: false,
  templateUrl: './admin-tax-filing.component.html',
  styleUrl: './admin-tax-filing.component.scss'
})
export class AdminTaxFilingComponent implements OnInit {
  taxFilings: any[] = [];              // Stores all tax filing records
  showDeleteConfirmation = false;     // Controls the "Delete All" confirmation modal
  showModal = false;                  // Controls the new filing modal
  uid: string = 'BqQ201IVDTa8tFPqGqEi8txeUrn1';

  constructor(private firestore: Firestore, private authService: AuthService) {}

  ngOnInit(): void {
    this.fetchAllTaxFilings();        // Admin sees all filings
  }
  async getCurrentUserId() {
  }
  // Fetch all filings from Firestore (no UID filter for admin)
  async fetchAllTaxFilings() {
    const filingsRef = collection(this.firestore, 'taxFilings');
    const snapshot = await getDocs(filingsRef);
    this.taxFilings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Open modal for creating new tax declaration
  openModal() {
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  // Close modal
  closeModal() {
    this.showModal = false;
    document.body.style.overflow = 'auto';
  }
// Approve a specific tax filing
async approveFiling(filingId: string) {
  try {
    const filingRef = doc(this.firestore, 'taxFilings', filingId);
    await updateDoc(filingRef, { status: 'Approved' });

    // Update the local list to reflect the change immediately
    this.taxFilings = this.taxFilings.map(filing =>
      filing.id === filingId ? { ...filing, status: 'Approved' } : filing
    );

    alert('Tax filing has been approved.');
  } catch (error) {
    console.error('Error approving filing:', error);
    alert('Failed to approve the tax filing. Please try again later.');
  }
}
  // Open confirmation modal for deleting all filings
  openDeleteConfirmation() {
    this.showDeleteConfirmation = true;
  }

  // Close confirmation modal
  closeDeleteConfirmation() {
    this.showDeleteConfirmation = false;
  }

  // Delete all tax filings (for admin)
  async deleteAllFilings() {
    const filingsRef = collection(this.firestore, 'taxFilings');
    const snapshot = await getDocs(filingsRef);

    try {
      for (const docSnapshot of snapshot.docs) {
        const filingRef = doc(this.firestore, 'taxFilings', docSnapshot.id);
        await deleteDoc(filingRef);
      }
      this.taxFilings = []; // Clear local list
      this.closeDeleteConfirmation();
      alert('All tax filings have been deleted successfully!');
    } catch (error) {
      console.error('Error deleting filings:', error);
      alert('Failed to delete the tax filings. Please try again later.');
    }
  }

  // Confirm before deleting a specific filing
  confirmDelete(filingId: string) {
    if (confirm('Are you sure you want to delete this tax filing?')) {
      this.deleteFiling(filingId);
    }
  }

  // Delete a specific tax filing
  async deleteFiling(filingId: string) {
    try {
      const filingRef = doc(this.firestore, 'taxFilings', filingId);
      await deleteDoc(filingRef);
      this.taxFilings = this.taxFilings.filter(filing => filing.id !== filingId);
      alert('Tax filing deleted successfully!');
    } catch (error) {
      console.error('Error deleting filing:', error);
      alert('Failed to delete the filing. Please try again later.');
    }
  }
}
