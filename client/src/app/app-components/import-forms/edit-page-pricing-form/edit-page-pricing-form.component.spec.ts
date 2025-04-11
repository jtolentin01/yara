import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPagePricingFormComponent } from './edit-page-pricing-form.component';

describe('EditPagePricingFormComponent', () => {
  let component: EditPagePricingFormComponent;
  let fixture: ComponentFixture<EditPagePricingFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPagePricingFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPagePricingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
