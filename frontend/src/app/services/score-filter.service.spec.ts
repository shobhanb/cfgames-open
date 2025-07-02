import { TestBed } from '@angular/core/testing';

import { ScoreFilterService } from './score-filter.service';

describe('ScoreFilterService', () => {
  let service: ScoreFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScoreFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
