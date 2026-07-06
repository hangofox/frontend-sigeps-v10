import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddUpdDelProgTurnoEmpleadoComponent } from './add-upd-del-prog-turno-empleado.component';

describe('AddUpdDelProgTurnoEmpleadoComponent', () => {
  let component: AddUpdDelProgTurnoEmpleadoComponent;
  let fixture: ComponentFixture<AddUpdDelProgTurnoEmpleadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUpdDelProgTurnoEmpleadoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpdDelProgTurnoEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
