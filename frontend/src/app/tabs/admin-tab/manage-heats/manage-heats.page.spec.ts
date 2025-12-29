import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageHeatsPage } from './manage-heats.page';

describe('ManageHeatsPage', () => {
  let component: ManageHeatsPage;
  let fixture: ComponentFixture<ManageHeatsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageHeatsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
