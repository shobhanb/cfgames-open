import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RenameTeamsPage } from './rename-teams.page';

describe('RenameTeamsPage', () => {
  let component: RenameTeamsPage;
  let fixture: ComponentFixture<RenameTeamsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RenameTeamsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
