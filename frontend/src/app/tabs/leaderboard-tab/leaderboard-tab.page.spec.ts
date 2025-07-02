import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeaderboardTabPage } from './leaderboard-tab.page';

describe('LeaderboardTabPage', () => {
  let component: LeaderboardTabPage;
  let fixture: ComponentFixture<LeaderboardTabPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaderboardTabPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
