import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmzIdCheckerFormComponent } from './amz-id-checker-form.component';

describe('AmzIdCheckerFormComponent', () => {
  let component: AmzIdCheckerFormComponent;
  let fixture: ComponentFixture<AmzIdCheckerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmzIdCheckerFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmzIdCheckerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
