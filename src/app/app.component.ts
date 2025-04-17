import { authRoutes } from './auth/auth.routes';
import { Component, OnInit } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Router, RouterOutlet, NavigationStart } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {


  constructor(private auth: Auth, private router: Router) {}

  ngOnInit(): void {
    // Listen for Firebase auth changes.
    onAuthStateChanged(this.auth, (user) => {
      if (!user) {
        // If not authenticated, force navigation to login.
        this.router.navigate(['/auth/login'], { replaceUrl: true });
      }
    });
    // Listen to browser's back button (popstate event)
    window.onpopstate = () => {
      if (!this.auth.currentUser) {
        this.router.navigate(['/auth/login'], { replaceUrl: true });
      }
    };
  }
}
