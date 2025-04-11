import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetDimensionsFormComponent } from './get-dimensions-form.component';

describe('GetDimensionsFormComponent', () => {
  let component: GetDimensionsFormComponent;
  let fixture: ComponentFixture<GetDimensionsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetDimensionsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetDimensionsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
