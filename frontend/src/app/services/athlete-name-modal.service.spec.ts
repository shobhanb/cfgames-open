import { TestBed } from '@angular/core/testing';

import { AthleteNameModalService } from './athlete-name-modal.service';

describe('AthleteNameModalService', () => {
  let service: AthleteNameModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AthleteNameModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
