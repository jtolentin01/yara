import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmazonReviewsFormComponent } from './amazon-reviews-form.component';

describe('AmazonReviewsFormComponent', () => {
  let component: AmazonReviewsFormComponent;
  let fixture: ComponentFixture<AmazonReviewsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmazonReviewsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmazonReviewsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
