import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListadoHistorialMovimientosEmpleadosComponent } from './listado-historial-movimientos-empleados.component';

describe('ListadoHistorialMovimientosEmpleadosComponent', () => {
  let component: ListadoHistorialMovimientosEmpleadosComponent;
  let fixture: ComponentFixture<ListadoHistorialMovimientosEmpleadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListadoHistorialMovimientosEmpleadosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoHistorialMovimientosEmpleadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
