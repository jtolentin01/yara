import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmazonPageFormComponent } from './amazon-page-form.component';

describe('AmazonPageFormComponent', () => {
  let component: AmazonPageFormComponent;
  let fixture: ComponentFixture<AmazonPageFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmazonPageFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmazonPageFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
