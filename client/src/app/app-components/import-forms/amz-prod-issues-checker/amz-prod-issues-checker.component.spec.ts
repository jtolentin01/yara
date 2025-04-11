import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmzProdIssuesCheckerComponent } from './amz-prod-issues-checker.component';

describe('AmzProdIssuesCheckerComponent', () => {
  let component: AmzProdIssuesCheckerComponent;
  let fixture: ComponentFixture<AmzProdIssuesCheckerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmzProdIssuesCheckerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmzProdIssuesCheckerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
