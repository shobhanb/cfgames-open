import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JudgeAvailabilityOverridePage } from './judge-availability-override.page';

describe('JudgeAvailabilityOverridePage', () => {
  let component: JudgeAvailabilityOverridePage;
  let fixture: ComponentFixture<JudgeAvailabilityOverridePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(JudgeAvailabilityOverridePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
