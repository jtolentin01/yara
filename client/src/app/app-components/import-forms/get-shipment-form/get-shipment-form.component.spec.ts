import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetShipmentFormComponent } from './get-shipment-form.component';

describe('GetShipmentFormComponent', () => {
  let component: GetShipmentFormComponent;
  let fixture: ComponentFixture<GetShipmentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetShipmentFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetShipmentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
