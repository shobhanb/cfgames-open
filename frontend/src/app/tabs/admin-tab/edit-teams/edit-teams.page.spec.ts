import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditTeamsPage } from './edit-teams.page';

describe('TeamsPage', () => {
  let component: EditTeamsPage;
  let fixture: ComponentFixture<EditTeamsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTeamsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
