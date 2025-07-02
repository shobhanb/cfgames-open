import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminTabPage } from './admin-tab.page';

describe('AdminTabPage', () => {
  let component: AdminTabPage;
  let fixture: ComponentFixture<AdminTabPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminTabPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
