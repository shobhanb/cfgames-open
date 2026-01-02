import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllHeatsPage } from './all-heats.page';

describe('AllHeatsPage', () => {
  let component: AllHeatsPage;
  let fixture: ComponentFixture<AllHeatsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AllHeatsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
