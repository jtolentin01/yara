import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParserFormComponent } from './parser-form.component';

describe('ParserFormComponent', () => {
  let component: ParserFormComponent;
  let fixture: ComponentFixture<ParserFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParserFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
