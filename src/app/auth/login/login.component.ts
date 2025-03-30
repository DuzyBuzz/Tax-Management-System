import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    if (!this.email || !this.password) {
      window.alert("Please enter both email and password.");
      return;
    }

    this.loading = true;
    this.authService.loginWithCredentials(this.email, this.password)
      .then(user => {
        this.loading = false;
        this.redirectUser(user.email); // ✅ Redirect user after successful login
      })
      .catch(errorMessage => {
        this.loading = false;
        window.alert(errorMessage);
      });
  }

  loginWithGoogle() {
    this.loading = true;
    this.authService.googleSignIn()
      .then(user => {
        this.loading = false;
        this.redirectUser(user.email); // ✅ Redirect user after successful login
      })
      .catch(errorMessage => {
        this.loading = false;
        window.alert(errorMessage);
      });
  }

  private redirectUser(email: string | null) {
    if (!email) return;
    if (email === this.authService.getAdminEmail()) {
      this.router.navigate(['/admin']);  // ✅ Redirect to admin
    } else {
      this.router.navigate(['/users']);  // ✅ Redirect to normal user page
    }
  }
}
