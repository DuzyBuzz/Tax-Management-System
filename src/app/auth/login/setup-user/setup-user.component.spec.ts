import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupUserComponent } from './setup-user.component';

describe('SetupUserComponent', () => {
  let component: SetupUserComponent;
  let fixture: ComponentFixture<SetupUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetupUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetupUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
