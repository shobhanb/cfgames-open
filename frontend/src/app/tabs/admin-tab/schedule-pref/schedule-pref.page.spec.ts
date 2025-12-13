import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SchedulePrefPage } from './schedule-pref.page';

describe('SchedulePrefPage', () => {
  let component: SchedulePrefPage;
  let fixture: ComponentFixture<SchedulePrefPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SchedulePrefPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
