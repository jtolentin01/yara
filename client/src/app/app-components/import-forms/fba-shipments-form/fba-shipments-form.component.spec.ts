import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FbaShipmentsFormComponent } from './fba-shipments-form.component';

describe('FbaShipmentsFormComponent', () => {
  let component: FbaShipmentsFormComponent;
  let fixture: ComponentFixture<FbaShipmentsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FbaShipmentsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FbaShipmentsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
