import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddUpdDelNovedadEmpleadoComponent } from './add-upd-del-novedad-empleado.component';

describe('AddUpdDelNovedadEmpleadoComponent', () => {
  let component: AddUpdDelNovedadEmpleadoComponent;
  let fixture: ComponentFixture<AddUpdDelNovedadEmpleadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUpdDelNovedadEmpleadoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpdDelNovedadEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
