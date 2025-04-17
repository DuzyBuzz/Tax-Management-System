import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxFilingFormComponent } from './tax-filing-form.component';

describe('TaxFilingFormComponent', () => {
  let component: TaxFilingFormComponent;
  let fixture: ComponentFixture<TaxFilingFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaxFilingFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaxFilingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
