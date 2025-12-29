import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { judgeUserGuard } from './judge-user.guard';

describe('judgeUserGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => judgeUserGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
