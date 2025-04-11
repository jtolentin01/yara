import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VocScraperFormComponent } from './voc-scraper-form.component';

describe('VocScraperFormComponent', () => {
  let component: VocScraperFormComponent;
  let fixture: ComponentFixture<VocScraperFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VocScraperFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VocScraperFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
