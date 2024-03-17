import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementosPage } from './elementos.page';

describe('ElementosPage', () => {
  let component: ElementosPage;
  let fixture: ComponentFixture<ElementosPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ElementosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
