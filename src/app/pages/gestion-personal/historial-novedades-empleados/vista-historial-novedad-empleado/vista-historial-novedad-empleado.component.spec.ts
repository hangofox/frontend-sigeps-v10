import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VistaNovedadEmpleadoComponent } from './vista-novedad-empleado.component';

describe('VistaNovedadEmpleadoComponent', () => {
  let component: VistaNovedadEmpleadoComponent;
  let fixture: ComponentFixture<VistaNovedadEmpleadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VistaNovedadEmpleadoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VistaNovedadEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
