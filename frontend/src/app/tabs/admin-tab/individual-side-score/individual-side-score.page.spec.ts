import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IndividualSideScorePage } from './individual-side-score.page';

describe('IndividualSideScorePage', () => {
  let component: IndividualSideScorePage;
  let fixture: ComponentFixture<IndividualSideScorePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(IndividualSideScorePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
