import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsiteScraperFormComponent } from './website-scraper-form.component';

describe('WebsiteScraperFormComponent', () => {
  let component: WebsiteScraperFormComponent;
  let fixture: ComponentFixture<WebsiteScraperFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebsiteScraperFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebsiteScraperFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
