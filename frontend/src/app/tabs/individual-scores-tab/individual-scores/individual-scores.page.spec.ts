import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IndividualScoresPage } from './individual-scores.page';

describe('IndividualScoresPage', () => {
  let component: IndividualScoresPage;
  let fixture: ComponentFixture<IndividualScoresPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(IndividualScoresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
