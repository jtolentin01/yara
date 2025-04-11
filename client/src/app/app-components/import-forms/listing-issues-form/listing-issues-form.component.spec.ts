import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingIssuesFormComponent } from './listing-issues-form.component';

describe('ListingIssuesFormComponent', () => {
  let component: ListingIssuesFormComponent;
  let fixture: ComponentFixture<ListingIssuesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListingIssuesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListingIssuesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
