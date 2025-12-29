import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeatsPage } from './heats.page';

describe('HeatsPage', () => {
  let component: HeatsPage;
  let fixture: ComponentFixture<HeatsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
