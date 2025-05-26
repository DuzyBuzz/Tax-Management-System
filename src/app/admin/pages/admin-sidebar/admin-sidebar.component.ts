import { Component } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { faker } from '@faker-js/faker';
import { collection, addDoc, Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-admin-sidebar',
  imports: [RouterLink, CommonModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.scss'
})
export class AdminSidebarComponent {
  constructor(private authService: AuthService, private firestore: Firestore) {}

  logout() {
    this.authService.logout();
  }
    mobileMenuOpen = false;

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  list50sample_tax_filings(){
    //list 50 sample tax filings and safe it to firestore with complete data


  }
  async seedSampleTaxFilings(count: number = 20) {
    const barangays = ['Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5'];
    const statuses = ['Payment Sent', 'Received', 'Declined' ];
    for (let i = 0; i < count; i++) {
      const activities = [
        {
          activityName: faker.company.catchPhrase(),
          capitalInvestment: faker.number.int({ min: 10000, max: 1000000 }),
          grossReceiptsEssential: faker.number.int({ min: 10000, max: 500000 }),
          grossReceiptsNonEssential: faker.number.int({ min: 1000, max: 100000 }),
        }
      ];
      const payments = [
        {
          name: 'Business Tax',
          taxDue: faker.number.int({ min: 1000, max: 10000 }),
          interest: faker.number.int({ min: 0, max: 500 }),
          surcharge: faker.number.int({ min: 0, max: 500 }),
        },
        {
          name: 'Mayor\'s Permit Fee',
          taxDue: faker.number.int({ min: 500, max: 2000 }),
          interest: faker.number.int({ min: 0, max: 200 }),
          surcharge: faker.number.int({ min: 0, max: 200 }),
        }
      ];
      const grandTotal = payments.reduce((sum, p) => sum + p.taxDue + p.interest + p.surcharge, 0);

      const filing = {
        businessId: faker.string.uuid(),
        topNo: faker.string.numeric(6),
        typeOfApplication: faker.helpers.arrayElement(['New', 'Renew']),
        businessName: faker.company.name(),
        ownerName: faker.name.fullName(),
        numberOfEmployees: faker.number.int({ min: 1, max: 100 }),
        barangay: faker.helpers.arrayElement(barangays),
        addressDateAssessed: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
        taxYear: faker.date.recent({ days: 365 }).getFullYear(),
        contactNumber: `09${faker.string.numeric(9)}`,
        status: faker.helpers.arrayElement(statuses),
        activities,
        payments,
        grandTotal,
        createdAt: new Date()
      };

      await addDoc(collection(this.firestore, 'tax_filings'), filing);
    }
    alert(`${count} sample tax filings added!`);
  }
}
