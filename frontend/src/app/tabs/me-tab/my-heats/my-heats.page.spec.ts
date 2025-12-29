import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyHeatsPage } from './my-heats.page';

describe('MyHeatsPage', () => {
  let component: MyHeatsPage;
  let fixture: ComponentFixture<MyHeatsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MyHeatsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
