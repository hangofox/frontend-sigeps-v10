import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VistaHistorialMovimientoEmpleadoComponent } from './vista-historial-movimiento-empleado.component';

describe('VistaHistorialMovimientoEmpleadoComponent', () => {
  let component: VistaHistorialMovimientoEmpleadoComponent;
  let fixture: ComponentFixture<VistaHistorialMovimientoEmpleadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VistaHistorialMovimientoEmpleadoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VistaHistorialMovimientoEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
