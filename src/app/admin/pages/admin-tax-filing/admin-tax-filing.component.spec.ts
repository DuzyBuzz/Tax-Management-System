import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTaxFilingComponent } from './admin-tax-filing.component';

describe('AdminTaxFilingComponent', () => {
  let component: AdminTaxFilingComponent;
  let fixture: ComponentFixture<AdminTaxFilingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTaxFilingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminTaxFilingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
