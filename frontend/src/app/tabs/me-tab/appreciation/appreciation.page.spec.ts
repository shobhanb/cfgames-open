import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppreciationPage } from './appreciation.page';

describe('AppreciationPage', () => {
  let component: AppreciationPage;
  let fixture: ComponentFixture<AppreciationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AppreciationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
