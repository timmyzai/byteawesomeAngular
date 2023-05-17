import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecretPlaceComponent } from './secret-place.component';

describe('SecretPlaceComponent', () => {
  let component: SecretPlaceComponent;
  let fixture: ComponentFixture<SecretPlaceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SecretPlaceComponent]
    });
    fixture = TestBed.createComponent(SecretPlaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
