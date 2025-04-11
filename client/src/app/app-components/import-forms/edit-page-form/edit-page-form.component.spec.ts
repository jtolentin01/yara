import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPageFormComponent } from './edit-page-form.component';

describe('EditPageFormComponent', () => {
  let component: EditPageFormComponent;
  let fixture: ComponentFixture<EditPageFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPageFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPageFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
