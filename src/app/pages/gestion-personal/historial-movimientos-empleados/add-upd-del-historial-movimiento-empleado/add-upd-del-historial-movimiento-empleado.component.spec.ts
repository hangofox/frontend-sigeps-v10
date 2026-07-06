import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddUpdDelHistorialMovimientoEmpleadoComponent } from './add-upd-del-historial-movimiento-empleado.component';

describe('AddUpdDelHistorialMovimientoEmpleadoComponent', () => {
  let component: AddUpdDelHistorialMovimientoEmpleadoComponent;
  let fixture: ComponentFixture<AddUpdDelHistorialMovimientoEmpleadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUpdDelHistorialMovimientoEmpleadoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpdDelHistorialMovimientoEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
