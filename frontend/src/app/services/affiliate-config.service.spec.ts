import { TestBed } from '@angular/core/testing';

import { AffiliateConfigService } from './affiliate-config.service';

describe('AffiliateConfigService', () => {
  let service: AffiliateConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AffiliateConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
