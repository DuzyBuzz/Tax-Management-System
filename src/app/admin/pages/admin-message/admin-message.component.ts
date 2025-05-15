import {
  Component,
  inject,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  query,
  orderBy,
  serverTimestamp
} from '@angular/fire/firestore';
import { Auth, user } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-message',
  templateUrl: './admin-message.component.html',
  styleUrl: './admin-message.component.scss',
  standalone: false
})
export class AdminMessageComponent implements OnInit, AfterViewInit {
  // Firebase services
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  // Reactive form for input
  form: FormGroup;

  // Observable user info
  user$ = user(this.auth);
  currentUser: any;

  // Realtime messages observable
  messages$: Observable<any[]>;

  @ViewChild('chatWindow') chatWindow!: ElementRef;

  constructor(private fb: FormBuilder) {
    // Initialize input form
    this.form = this.fb.group({
      text: ['']
    });

    // Get messages collection ordered by timestamp
    const messagesRef = collection(this.firestore, 'messages');
    const messagesQuery = query(messagesRef, orderBy('timestamp'));

    // Real-time observable stream of messages
    this.messages$ = collectionData(messagesQuery, { idField: 'id' });
  }

  ngOnInit() {
    // Get current authenticated user
    this.user$.subscribe(user => {
      this.currentUser = user;
    });

    // Scroll to bottom on every new message
    this.messages$.subscribe(() => {
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  ngAfterViewInit() {
    // Initial scroll
    this.scrollToBottom();
  }

  // Send message to Firestore
  async sendMessage() {
    const text = this.form.value.text?.trim();
    if (!text || !this.currentUser) return;

    try {
      const messagesRef = collection(this.firestore, 'messages');
      await addDoc(messagesRef, {
        text: text,
        sender: this.currentUser.email || this.currentUser.uid,
        timestamp: serverTimestamp()
      });

      // Clear the input field
      this.form.reset();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  // Scroll to the bottom of the chat
  scrollToBottom() {
    const el = document.getElementById('chatWindow');
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
}
