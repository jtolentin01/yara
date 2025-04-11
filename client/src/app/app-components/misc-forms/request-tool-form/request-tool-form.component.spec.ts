import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestToolFormComponent } from './request-tool-form.component';

describe('RequestToolFormComponent', () => {
  let component: RequestToolFormComponent;
  let fixture: ComponentFixture<RequestToolFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestToolFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestToolFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
