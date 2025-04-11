import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParserInvViewComponent } from './parser-inv-view.component';

describe('ParserInvViewComponent', () => {
  let component: ParserInvViewComponent;
  let fixture: ComponentFixture<ParserInvViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParserInvViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParserInvViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
