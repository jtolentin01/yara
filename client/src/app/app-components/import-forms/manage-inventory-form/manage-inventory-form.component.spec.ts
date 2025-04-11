import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageInventoryFormComponent } from './manage-inventory-form.component';

describe('ManageInventoryFormComponent', () => {
  let component: ManageInventoryFormComponent;
  let fixture: ComponentFixture<ManageInventoryFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageInventoryFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageInventoryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
