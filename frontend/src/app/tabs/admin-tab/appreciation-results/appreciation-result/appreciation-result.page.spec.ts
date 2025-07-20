import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppreciationResultPage } from './appreciation-result.page';

describe('AppreciationResultPage', () => {
  let component: AppreciationResultPage;
  let fixture: ComponentFixture<AppreciationResultPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AppreciationResultPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
