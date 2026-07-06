import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GraficasEstadisticasComponent } from './graficas-estadisticas.component';

describe('GraficasEstadisticasComponent', () => {
  let component: GraficasEstadisticasComponent;
  let fixture: ComponentFixture<GraficasEstadisticasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GraficasEstadisticasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficasEstadisticasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
