import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SipvScraperFormComponent } from './sipv-scraper-form.component';

describe('SipvScraperFormComponent', () => {
  let component: SipvScraperFormComponent;
  let fixture: ComponentFixture<SipvScraperFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SipvScraperFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SipvScraperFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
