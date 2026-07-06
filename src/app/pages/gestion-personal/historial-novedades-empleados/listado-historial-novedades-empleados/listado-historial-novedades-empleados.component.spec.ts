import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListadoNovedadesEmpleadosComponent } from './listado-novedades-empleados.component';

describe('ListadoNovedadesEmpleadosComponent', () => {
  let component: ListadoNovedadesEmpleadosComponent;
  let fixture: ComponentFixture<ListadoNovedadesEmpleadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListadoNovedadesEmpleadosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoNovedadesEmpleadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
