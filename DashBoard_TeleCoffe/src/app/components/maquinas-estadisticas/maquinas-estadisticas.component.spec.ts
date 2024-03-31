import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaquinasEstadisticasComponent } from './maquinas-estadisticas.component';

describe('MaquinasEstadisticasComponent', () => {
  let component: MaquinasEstadisticasComponent;
  let fixture: ComponentFixture<MaquinasEstadisticasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MaquinasEstadisticasComponent]
    });
    fixture = TestBed.createComponent(MaquinasEstadisticasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
