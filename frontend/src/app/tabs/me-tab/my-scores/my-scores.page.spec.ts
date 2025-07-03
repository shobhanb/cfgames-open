import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyScoresPage } from './my-scores.page';

describe('MyScoresPage', () => {
  let component: MyScoresPage;
  let fixture: ComponentFixture<MyScoresPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MyScoresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
