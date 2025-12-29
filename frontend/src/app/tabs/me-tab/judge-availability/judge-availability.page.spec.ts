import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JudgeAvailabilityPage } from './judge-availability.page';

describe('JudgeAvailabilityPage', () => {
  let component: JudgeAvailabilityPage;
  let fixture: ComponentFixture<JudgeAvailabilityPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(JudgeAvailabilityPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
