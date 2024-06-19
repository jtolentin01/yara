import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsinCheckerFormComponent } from './asin-checker-form.component';

describe('AsinCheckerFormComponent', () => {
  let component: AsinCheckerFormComponent;
  let fixture: ComponentFixture<AsinCheckerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsinCheckerFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsinCheckerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
