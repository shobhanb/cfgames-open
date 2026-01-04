import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CfdataRefreshPage } from './cfdata-refresh.page';

describe('CfdataRefreshPage', () => {
  let component: CfdataRefreshPage;
  let fixture: ComponentFixture<CfdataRefreshPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CfdataRefreshPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
