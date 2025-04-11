import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetTrackingNoComponent } from './get-tracking-no.component';

describe('GetTrackingNoComponent', () => {
  let component: GetTrackingNoComponent;
  let fixture: ComponentFixture<GetTrackingNoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetTrackingNoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetTrackingNoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
