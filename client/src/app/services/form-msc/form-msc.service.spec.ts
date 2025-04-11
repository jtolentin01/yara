import { TestBed } from '@angular/core/testing';

import { FormMscService } from './form-msc.service';

describe('FormMscService', () => {
  let service: FormMscService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormMscService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
