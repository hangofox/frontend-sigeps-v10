import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VistaProgTurnoEmpleadoComponent } from './vista-prog-turno-empleado.component';

describe('VistaProgTurnoEmpleadoComponent', () => {
  let component: VistaProgTurnoEmpleadoComponent;
  let fixture: ComponentFixture<VistaProgTurnoEmpleadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VistaProgTurnoEmpleadoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VistaProgTurnoEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
