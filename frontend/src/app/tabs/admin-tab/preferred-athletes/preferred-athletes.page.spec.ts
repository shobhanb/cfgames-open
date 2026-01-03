import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreferredAthletesPage } from './preferred-athletes.page';

describe('PreferredAthletesPage', () => {
  let component: PreferredAthletesPage;
  let fixture: ComponentFixture<PreferredAthletesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PreferredAthletesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
