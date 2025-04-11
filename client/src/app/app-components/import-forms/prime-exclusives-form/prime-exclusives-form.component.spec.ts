import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimeExclusivesFormComponent } from './prime-exclusives-form.component';

describe('PrimeExclusivesFormComponent', () => {
  let component: PrimeExclusivesFormComponent;
  let fixture: ComponentFixture<PrimeExclusivesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrimeExclusivesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrimeExclusivesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
