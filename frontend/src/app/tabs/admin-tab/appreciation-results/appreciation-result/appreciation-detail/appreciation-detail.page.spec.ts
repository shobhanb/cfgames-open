import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppreciationDetailPage } from './appreciation-detail.page';

describe('AppreciationDetailPage', () => {
  let component: AppreciationDetailPage;
  let fixture: ComponentFixture<AppreciationDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AppreciationDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
