import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IndividualScoresTabPage } from './individual-scores-tab.page';

describe('IndividualScoresTabPage', () => {
  let component: IndividualScoresTabPage;
  let fixture: ComponentFixture<IndividualScoresTabPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(IndividualScoresTabPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
