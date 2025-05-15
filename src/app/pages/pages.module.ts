import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { FullCalendarModule } from '@fullcalendar/angular';

import { TaxFilingComponent } from './tax-filing/tax-filing.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { TaxFilingFormComponent } from './tax-filing/tax-filing-form/tax-filing-form.component';
import { MessagesComponent } from './messages/messages.component';


@NgModule({
  declarations: [
    TaxFilingComponent,
    AppointmentsComponent,
    MessagesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    FullCalendarModule,
    TaxFilingFormComponent // if this is standalone, keep it here
  ],
  exports: [
    TaxFilingComponent,
    FullCalendarModule,
    AppointmentsComponent,
    MessagesComponent

  ],
})
export class PagesModule {}

