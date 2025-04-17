import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { addDoc, collection, doc, Firestore, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

// Custom Components
import { BusinessAddressMapComponent } from '../../../shared/core/business-address-map/business-address-map.component';
import { SpinnnerComponent } from '../../../shared/core/spinner/spinner.component';

@Component({
  selector: 'app-tax-filing-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BusinessAddressMapComponent,
    SpinnnerComponent
  ],
  templateUrl: './tax-filing-form.component.html',
  styleUrls: ['./tax-filing-form.component.scss']
})
export class TaxFilingFormComponent implements OnInit {
  // The UID passed from parent or route param
  @Input() uid: string | null = null;

  // Modal and Spinner states
  showMapModal = false;
  navigating = false;
  spinnerMessage = 'Saving your data, please wait...';

  // Form object holding all tax filing fields
  form = {
    businessId: '',
    businessName: '',
    businessAddress: '',
    fullName: '',
    contactNumber: '',
    email: '',
    forYear: 2025,
    lineOfBusinessCode: '',
    lineOfBusiness: '',
    monthlyGrossSales: '',
    periodCovered: '',
    plateNo: '',
    permitNo: '',
    dateIssued: '',
    dateRegistered: '',
    typeOfBusiness: '',
    noOfEmployees: '',
    deadline: '',
    tinNumber: '',
    natureOfBusiness: '',
    mayorsPermitNo: '',
    registrationNo: '',
    registrationDate: '',
    status: 'Pending'
  };


  constructor(
    private firestore: Firestore,
    private router: Router
  ) {}

  /**
   * On component init, fetch user data using UID and pre-fill the form.
   */
  async ngOnInit() {
    if (!this.uid) {
      console.error('UID is missing');
      return;
    }

    try {
      const userDocRef = doc(this.firestore, `users/${this.uid}`);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData: any = userSnap.data();
        this.form.fullName = userData.fullName || '';
        this.form.contactNumber = userData.contactNumber || '';
        this.form.email = userData.email || '';
      } else {
        console.warn('User document not found for UID:', this.uid);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }


  /**
   * Opens the business address map modal.
   */
  openMapModal() {
    this.showMapModal = true;
  }

  /**
   * Closes the business address map modal.
   */
  closeMapModal() {
    this.showMapModal = false;
  }

  /**
   * Sets the selected address from the map modal.
   * @param address Address returned from the child map component.
   */
  setAddress(address: string) {
    this.form.businessAddress = address;
    this.closeMapModal();
  }

  /**
   * Submits the form and saves data to Firestore.
   */
  async submitForm() {
    if (!this.uid) {
      console.error('UID is missing');
      return;
    }

    // Show spinner
    this.navigating = true;

    // Attach UID to form before saving
    const taxFilingData = {
      ...this.form,
      userUid: this.uid
    };

    try {
      // Save tax filing data into the Firestore collection
      const docRef = await addDoc(collection(this.firestore, 'taxFilings'), taxFilingData);
      console.log('✅ Tax filing document created with ID:', docRef.id);

      // Optional: Navigate back to dashboard or list
      this.router.navigate(['/taxpayer']);

    } catch (error) {
      console.error('❌ Error adding tax filing:', error);
    } finally {
      // Hide spinner regardless of success or failure
      this.navigating = false;
    }
  }



}
