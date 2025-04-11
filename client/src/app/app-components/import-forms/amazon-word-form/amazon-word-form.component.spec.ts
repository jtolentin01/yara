import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmazonWordFormComponent } from './amazon-word-form.component';

describe('AmazonWordFormComponent', () => {
  let component: AmazonWordFormComponent;
  let fixture: ComponentFixture<AmazonWordFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmazonWordFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmazonWordFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
