import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyAppreciationTextPage } from './my-appreciation-text.page';

describe('MyAppreciationTextPage', () => {
  let component: MyAppreciationTextPage;
  let fixture: ComponentFixture<MyAppreciationTextPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MyAppreciationTextPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
