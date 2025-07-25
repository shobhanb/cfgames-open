import { TestBed } from '@angular/core/testing';

import { AppInstallService } from './app-install.service';

describe('AppInstallService', () => {
  let service: AppInstallService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppInstallService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
