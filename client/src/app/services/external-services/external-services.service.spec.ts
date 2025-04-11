import { TestBed } from '@angular/core/testing';

import { ExternalServicesService } from './external-services.service';

describe('ExternalServicesService', () => {
  let service: ExternalServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExternalServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
