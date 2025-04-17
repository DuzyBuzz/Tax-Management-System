import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessAddressMapComponent } from './business-address-map.component';

describe('BusinessAddressMapComponent', () => {
  let component: BusinessAddressMapComponent;
  let fixture: ComponentFixture<BusinessAddressMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessAddressMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessAddressMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
