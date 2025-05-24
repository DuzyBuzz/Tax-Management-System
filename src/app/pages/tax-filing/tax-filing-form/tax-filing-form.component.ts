import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { addDoc, collection, doc, Firestore, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

import { BusinessAddressMapComponent } from '../../../shared/core/business-address-map/business-address-map.component';
import { SpinnnerComponent } from '../../../shared/core/spinner/spinner.component';

interface TaxFilingForm {
  businessId: string;
  businessName: string;
  businessAddress: string;
  fullName: string;
  contactNumber: string;
  email: string;
  forYear: number;
  lineOfBusinessCode: string;
  lineOfBusiness: string;
  monthlyGrossSales?: string;
  periodCovered?: string;
  plateNo: string;
  permitNo: string;
  dateIssued?: string;
  dateRegistered?: string;
  typeOfBusiness: string;
  noOfEmployees: number | null;
  deadline?: string;
  tinNumber?: string;
  natureOfBusiness?: string;
  mayorsPermitNo?: string;
  registrationNo?: string;
  registrationDate?: string;
  status: 'Pending' | 'Sent' | 'Approved';
}

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
  @Input() uid: string | null = null;

  showMapModal = false;
  navigating = false;
  spinnerMessage = 'Saving your data, please wait...';

  form: TaxFilingForm = {
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
    noOfEmployees: null,
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

  openMapModal() {
    this.showMapModal = true;
  }

  closeMapModal() {
    this.showMapModal = false;
  }

  setAddress(address: string) {
    this.form.businessAddress = address;
    this.closeMapModal();
  }

  async submitForm() {
    if (!this.uid) {
      console.error('UID is missing');
      return;
    }

    this.navigating = true;

    const taxFilingData = {
      ...this.form,
      userUid: this.uid
    };

    try {
      await addDoc(collection(this.firestore, 'taxFilings'), taxFilingData);
      console.log('✅ Tax filing document created');

      this.router.navigate(['/taxpayer']);
    } catch (error) {
      console.error('❌ Error adding tax filing:', error);
    } finally {
      this.navigating = false;
    }
  }
}
