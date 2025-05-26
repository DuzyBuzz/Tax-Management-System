import { CommonModule } from '@angular/common';
import { authRoutes } from './auth/auth.routes';
import { Component, OnInit, Input } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Router, RouterOutlet, NavigationStart } from '@angular/router';
interface BusinessInfoCol {
  label: string;
  value: string | number;
  colSpan?: number;
  hasRightBorder?: boolean;
}

interface Activity {
  name: string;
  capitalInvestment: number;
  grossReceiptsEssential: number;
  grossReceiptsNonEssential: number;
}

interface TaxBreakdownItem {
  particular: string;
  taxDue: number;
  interest: number;
  surcharge: number;
  total: number;
}
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
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
    @Input() businessInfoRows: BusinessInfoCol[][] = [];
  @Input() activities: Activity[] = [];
  @Input() taxBreakdown: TaxBreakdownItem[] = [];
  @Input() grandTotal: number = 0;
  @Input() remarks: string[] = [];
  @Input() paymentMode: string = '';
  @Input() status: string = '';
  @Input() dueDate: Date = new Date();
  @Input() notes: string[] = [];

  print() {
    window.print();
  }

  close() {
    // Logic to close the modal
  }
}

