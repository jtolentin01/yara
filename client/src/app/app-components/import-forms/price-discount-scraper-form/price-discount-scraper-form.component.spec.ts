import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceDiscountScraperFormComponent } from './price-discount-scraper-form.component';

describe('PriceDiscountScraperFormComponent', () => {
  let component: PriceDiscountScraperFormComponent;
  let fixture: ComponentFixture<PriceDiscountScraperFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceDiscountScraperFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriceDiscountScraperFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
