import { Component, inject, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  query,
  orderBy,
  serverTimestamp
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Auth, user } from '@angular/fire/auth';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit, AfterViewInit {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  user$ = user(this.auth);
  currentUser: any;

  form: FormGroup;
  messages$: Observable<any[]>;

  @ViewChild('chatWindow') chatWindow!: ElementRef;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      text: ['']
    });

    const messagesRef = collection(this.firestore, 'messages');
    const messagesQuery = query(messagesRef, orderBy('timestamp'));
    this.messages$ = collectionData(messagesQuery, { idField: 'id' });
  }

  ngOnInit() {
    this.user$.subscribe(user => {
      this.currentUser = user;
    });

    this.messages$.subscribe(() => {
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  async sendMessage() {
    const text = this.form.value.text?.trim();
    if (!text || !this.currentUser) return;

    const sender = this.currentUser.email || this.currentUser.uid;

    try {
      const messagesRef = collection(this.firestore, 'messages');
      await addDoc(messagesRef, {
        text,
        sender,
        timestamp: serverTimestamp()
      });
      this.form.reset();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  }


  scrollToBottom() {
    const el = document.getElementById('chatWindow');
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
}
