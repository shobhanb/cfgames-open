import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CfEventsPage } from './cf-events.page';

describe('CfEventsPage', () => {
  let component: CfEventsPage;
  let fixture: ComponentFixture<CfEventsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CfEventsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
