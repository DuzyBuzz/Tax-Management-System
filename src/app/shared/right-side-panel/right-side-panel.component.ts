import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { User } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-right-side-panel',
  standalone: false,
  templateUrl: './right-side-panel.component.html',
  styleUrls: ['./right-side-panel.component.scss']
})
export class RightSidePanelComponent{
  user$: Observable<User | null>; // Observable for user state
  dropdownOpen = false; // Controls dropdown visibility
  navigating = false;

  constructor(private authService: AuthService) {
    this.user$ = this.authService.getCurrentUser(); // Subscribe to user data
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout() {
    this.authService.logout();      
  }

}
