import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppreciationStatusPage } from './appreciation-status.page';

describe('AppreciationStatusPage', () => {
  let component: AppreciationStatusPage;
  let fixture: ComponentFixture<AppreciationStatusPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AppreciationStatusPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
