import { Injectable } from '@angular/core';
import { Auth, User, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment'; // ✅ Import environment

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false); // Add loading state

  constructor(private auth: Auth, private router: Router) {
    // Listen for authentication state changes
    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user);
    });
  }

  // ✅ Get current user as Observable
  getCurrentUser(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  // ✅ Get current user ID (optimized version)
  async getCurrentUserId(): Promise<string | null> {
    const currentUser = this.userSubject.value;
    return currentUser ? currentUser.uid : null;
  }

  // ✅ Email/Password Login
  loginWithCredentials(email: string, password: string): Promise<User> {
    this.loadingSubject.next(true); // Start loading
    return signInWithEmailAndPassword(this.auth, email.trim(), password.trim())
      .then(userCredential => {
        this.loadingSubject.next(false); // Stop loading
        return userCredential.user;
      })
      .catch(error => {
        this.loadingSubject.next(false); // Stop loading
        throw this.handleAuthError(error);
      });
  }

  // ✅ Google Sign-In
  googleSignIn(): Promise<User> {
    this.loadingSubject.next(true); // Start loading
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider)
      .then(result => {
        this.loadingSubject.next(false); // Stop loading
        return result.user;
      })
      .catch(error => {
        this.loadingSubject.next(false); // Stop loading
        throw this.handleAuthError(error);
      });
  }

  // ✅ Logout
  logout(): Promise<void> {
    this.loadingSubject.next(true);
    return signOut(this.auth)
      .then(() => {
        this.loadingSubject.next(false);
        // Force hard redirect to clear route stack
        window.location.href = '/auth/login';
      })
      .catch(error => {
        this.loadingSubject.next(false);
        throw this.handleAuthError(error);
      });
  }


  // ✅ Handle authentication error messages
  private handleAuthError(error: any): string {
    switch (error.code) {
      case 'auth/invalid-credential': return "Invalid email or password.";
      case 'auth/user-not-found': return "No account found with this email.";
      case 'auth/wrong-password': return "Incorrect password.";
      default: return error.message || "Authentication failed.";
    }
  }

  // ✅ Get loading state as Observable
  getLoadingState(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }
}
