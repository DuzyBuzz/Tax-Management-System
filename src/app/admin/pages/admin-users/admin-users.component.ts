import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from '@angular/fire/firestore';

@Component({
  selector: 'app-admin-users',
  standalone: false,
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent implements OnInit {
  userForm: FormGroup;
  users: any[] = [];
  editingUserId: string | null = null;
  private usersCollection;
  showUid = true;

  constructor(private fb: FormBuilder, private firestore: Firestore) {
    this.usersCollection = collection(this.firestore, 'users');

    this.userForm = this.fb.group({
      fullName: [''],
      email: [''],
      contactNumber: [''],
      uid: ['']
    });
  }

  ngOnInit(): void {
    collectionData(this.usersCollection, { idField: 'id' }).subscribe((data) => {
      this.users = data;
    });
  }

  async onSubmit() {
    const formData = this.userForm.value;

    if (this.editingUserId) {
      const userRef = doc(this.firestore, `users/${this.editingUserId}`);
      await updateDoc(userRef, formData);
    } else {
      await addDoc(this.usersCollection, {
        ...formData,
        createdAt: serverTimestamp()
      });
    }

    this.userForm.reset();
    this.editingUserId = null;
  }

  editUser(user: any) {
    this.editingUserId = user.id;
    this.userForm.setValue({
      fullName: user.fullName || '',
      email: user.email || '',
      contactNumber: user.contactNumber || '',
      uid: user.uid || ''
    });
  }

  async deleteUser(userId: string) {
    const confirmDelete = confirm('Are you sure you want to delete this user?');
    if (confirmDelete) {
      const userRef = doc(this.firestore, `users/${userId}`);
      await deleteDoc(userRef);
    }
  }

  cancelEdit() {
    this.editingUserId = null;
    this.userForm.reset();
  }
}
