import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetParentFormComponent } from './get-parent-form.component';

describe('GetParentFormComponent', () => {
  let component: GetParentFormComponent;
  let fixture: ComponentFixture<GetParentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetParentFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetParentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
