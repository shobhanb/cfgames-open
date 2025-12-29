import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppreciationScorePage } from './appreciation-score.page';

describe('AppreciationScorePage', () => {
  let component: AppreciationScorePage;
  let fixture: ComponentFixture<AppreciationScorePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AppreciationScorePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
