import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListadoProgTurnosEmpleadosComponent } from './listado-prog-turnos-empleados.component';

describe('ListadoProgTurnosEmpleadosComponent', () => {
  let component: ListadoProgTurnosEmpleadosComponent;
  let fixture: ComponentFixture<ListadoProgTurnosEmpleadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListadoProgTurnosEmpleadosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoProgTurnosEmpleadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
