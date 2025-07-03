import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SideScoresPage } from './side-scores.page';

describe('SideScoresPage', () => {
  let component: SideScoresPage;
  let fixture: ComponentFixture<SideScoresPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SideScoresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
