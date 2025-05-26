import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminComponent } from './admin.component';
import { TaxFilingComponent } from '../pages/tax-filing/tax-filing.component';
import { AdminTaxFilingComponent } from './pages/admin-tax-filing/admin-tax-filing.component';
import { AdminUsersComponent } from './pages/admin-users/admin-users.component';
import { AdminMessageComponent } from './pages/admin-message/admin-message.component';
import { SuccessfulTransactionsComponent } from './pages/successful-transactions/successful-transactions.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'admin-taxfiling', component: AdminTaxFilingComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'success', component: SuccessfulTransactionsComponent },
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];
