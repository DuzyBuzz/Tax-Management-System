import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '@angular/fire/auth';
import { environment } from '../../../environments/environment';
import { Firestore, collection, doc, getDoc, getDocs, query, where } from '@angular/fire/firestore';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private firestore: Firestore // ✅ Inject Firestore
  ) {}

  login() {
    if (!this.email || !this.password) {
      window.alert("Please enter both email and password.");
      return;
    }

    this.loading = true;
    this.authService.loginWithCredentials(this.email, this.password)
      .then(user => this.handleRedirect(user))
      .catch(errorMessage => {
        this.loading = false;
        window.alert(errorMessage);
      });
  }

  loginWithGoogle() {
    this.loading = true;
    this.authService.googleSignIn()
      .then(user => this.handleRedirect(user))
      .catch(errorMessage => {
        this.loading = false;
        window.alert(errorMessage);
      });
  }

  private async handleRedirect(user: User) {
    this.loading = false;

    // Query the 'admin' collection for a matching email
    const adminRef = collection(this.firestore, 'admin');
    const q = query(adminRef, where('email', '==', user.email));
    const querySnapshot = await getDocs(q);

    const isAdmin = !querySnapshot.empty;

    if (isAdmin) {
      this.router.navigate(['/admin']);
      return;
    }

    // Check if user profile already exists
    const userRef = doc(this.firestore, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      this.router.navigate(['/setup-user']);
    } else {
      this.router.navigate(['/taxpayer']);
    }
  }
}
