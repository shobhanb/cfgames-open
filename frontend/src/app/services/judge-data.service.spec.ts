import { TestBed } from '@angular/core/testing';

import { JudgeDataService } from './judge-data.service';

describe('JudgeDataService', () => {
  let service: JudgeDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JudgeDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
