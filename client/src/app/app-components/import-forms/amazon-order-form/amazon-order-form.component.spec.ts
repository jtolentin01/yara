import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmazonOrderFormComponent } from './amazon-order-form.component';

describe('AmazonOrderFormComponent', () => {
  let component: AmazonOrderFormComponent;
  let fixture: ComponentFixture<AmazonOrderFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmazonOrderFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmazonOrderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
