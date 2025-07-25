import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutoAssignTeamsPage } from './auto-assign-teams.page';

describe('AutoAssignTeamsPage', () => {
  let component: AutoAssignTeamsPage;
  let fixture: ComponentFixture<AutoAssignTeamsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoAssignTeamsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
