import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeamScoresPage } from './team-scores.page';

describe('TeamScoresPage', () => {
  let component: TeamScoresPage;
  let fixture: ComponentFixture<TeamScoresPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamScoresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
