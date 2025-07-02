import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MeTabPage } from './me-tab.page';

describe('MeTabPage', () => {
  let component: MeTabPage;
  let fixture: ComponentFixture<MeTabPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MeTabPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
