import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './admin.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminSidebarComponent } from './pages/admin-sidebar/admin-sidebar.component';
import { RouterModule } from '@angular/router';
import { adminRoutes } from './admin.routes';
import { AdminTaxFilingComponent } from './pages/admin-tax-filing/admin-tax-filing.component';
import { TaxFilingFormComponent } from '../pages/tax-filing/tax-filing-form/tax-filing-form.component';
import { UsersComponent } from '../users/users.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminUsersComponent } from './pages/admin-users/admin-users.component';
import { AdminMessageComponent } from './pages/admin-message/admin-message.component';



@NgModule({
  declarations: [AdminComponent, AdminTaxFilingComponent, AdminUsersComponent, AdminMessageComponent],
  imports: [
    RouterModule.forChild(adminRoutes),
    CommonModule,
    AdminDashboardComponent,
    AdminSidebarComponent,
    RouterModule,
    TaxFilingFormComponent,
    ReactiveFormsModule
  ],
  exports: [
    AdminTaxFilingComponent,
    AdminUsersComponent,
    AdminMessageComponent
  ]
})
export class AdminModule { }
