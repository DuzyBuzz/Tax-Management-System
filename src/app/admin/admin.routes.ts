import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminComponent } from './admin.component';
import { TaxFilingComponent } from '../pages/tax-filing/tax-filing.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'taxfiling', component: TaxFilingComponent },
      { path: 'users', component: AdminDashboardComponent },
      { path: 'reports', component: AdminDashboardComponent },
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];
