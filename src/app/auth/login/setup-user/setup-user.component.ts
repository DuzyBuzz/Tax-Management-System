import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Firestore, collection, addDoc, setDoc, doc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { User } from 'firebase/auth';
import { SpinnnerComponent } from '../../../shared/core/spinner/spinner.component';

@Component({
  selector: 'app-setup-user',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SpinnnerComponent],
  templateUrl: './setup-user.component.html',
  styleUrls: ['./setup-user.component.scss']
})
export class SetupUserComponent {
  businessName = '';
  businessAddress = '';
  fullName = '';
  contactNumber = '';
  lineOfBusiness = '';
  showConfirmModal = false;
  navigating = false;
  spinnerMessage = '';

  private auth = inject(Auth);

  constructor(private router: Router, private firestore: Firestore) {}

  private toTitleCase(value: string): string {
    return value
      .toLowerCase()
      .split(' ')
      .filter(word => word.trim() !== '')
      .map(word => word[0].toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Trigger modal confirmation; do not call submit() directly.
  confirmSubmission() {
    if (
      !this.fullName ||
      !this.contactNumber
    ) {
      alert('Please fill out all fields.');
      return;
    }
    this.showConfirmModal = true;
  }

  // Called from the confirmation modal's "Confirm" button.
  async submit() {
    const user = this.auth.currentUser as User | null;
    if (!user) {
      alert('User not authenticated.');
      return;
    }

    this.navigating = true;
    this.spinnerMessage = 'Saving profile...';

    const formattedFullName = this.toTitleCase(this.fullName);


    const userData = {
      uid: user.uid,
      email: user.email,
      contactNumber: this.contactNumber,
      fullName: formattedFullName,
      createdAt: new Date()
    };

    try {

      // Save basic user info to "users" with UID as document ID
      const userRef = collection(this.firestore, 'users');
      await setDoc(doc(userRef, user.uid), userData); // 👈 import setDoc and doc

      this.router.navigate(['/taxpayer']);
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      this.navigating = false;
      this.showConfirmModal = false;
    }
  }


  cancelModal() {
    this.showConfirmModal = false;
  }
}
