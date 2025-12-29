import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JudgesPage } from './judges.page';

describe('JudgesPage', () => {
  let component: JudgesPage;
  let fixture: ComponentFixture<JudgesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(JudgesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
