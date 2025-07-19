import { TestBed } from '@angular/core/testing';

import { AthleteDataService } from './athlete-data.service';

describe('DataAthleteDetailService', () => {
  let service: AthleteDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AthleteDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
