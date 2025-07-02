import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeamScoresTabPage } from './team-scores-tab.page';

describe('TeamScoresTabPage', () => {
  let component: TeamScoresTabPage;
  let fixture: ComponentFixture<TeamScoresTabPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamScoresTabPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
