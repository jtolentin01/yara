import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkuExtractorFormComponent } from './sku-extractor-form.component';

describe('SkuExtractorFormComponent', () => {
  let component: SkuExtractorFormComponent;
  let fixture: ComponentFixture<SkuExtractorFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkuExtractorFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkuExtractorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
