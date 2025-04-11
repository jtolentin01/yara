import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmazonReviewsLiteFormComponent } from './amazon-reviews-lite-form.component';

describe('AmazonReviewsLiteFormComponent', () => {
  let component: AmazonReviewsLiteFormComponent;
  let fixture: ComponentFixture<AmazonReviewsLiteFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmazonReviewsLiteFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmazonReviewsLiteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
