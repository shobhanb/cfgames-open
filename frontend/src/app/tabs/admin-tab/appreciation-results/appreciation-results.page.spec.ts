import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppreciationResultsPage } from './appreciation-results.page';

describe('AppreciationResultsPage', () => {
  let component: AppreciationResultsPage;
  let fixture: ComponentFixture<AppreciationResultsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AppreciationResultsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
