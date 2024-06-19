import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingLoaderFormComponent } from './listing-loader-form.component';

describe('ListingLoaderFormComponent', () => {
  let component: ListingLoaderFormComponent;
  let fixture: ComponentFixture<ListingLoaderFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListingLoaderFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListingLoaderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
