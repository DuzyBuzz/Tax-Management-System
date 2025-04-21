import { Routes } from '@angular/router';
import { UsersComponent } from './users.component';
import { TaxFilingComponent } from '../pages/tax-filing/tax-filing.component';
import { AppointmentsComponent } from '../pages/appointments/appointments.component';
import { MessagesComponent } from '../pages/messages/messages.component';


export const usersRoutes: Routes = [
  { path: '', component: UsersComponent, children: [
    { path: '', redirectTo: 'appointments', pathMatch: 'full' },
    { path: 'appointments', component: AppointmentsComponent},
    { path: 'tax-filing', component: TaxFilingComponent},
    { path: 'messages', component: MessagesComponent}
  ]}
];
