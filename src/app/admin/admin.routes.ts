import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminComponent } from './admin.component';
import { TaxFilingComponent } from '../pages/tax-filing/tax-filing.component';
import { AdminTaxFilingComponent } from './pages/admin-tax-filing/admin-tax-filing.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'admin-taxfiling', component: AdminTaxFilingComponent },
      { path: 'users', component: AdminDashboardComponent },
      { path: 'reports', component: AdminDashboardComponent },
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];
