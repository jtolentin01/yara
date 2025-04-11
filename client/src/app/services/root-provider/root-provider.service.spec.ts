import { TestBed } from '@angular/core/testing';

import { RootProviderService } from './root-provider.service';

describe('RootProviderService', () => {
  let service: RootProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RootProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
