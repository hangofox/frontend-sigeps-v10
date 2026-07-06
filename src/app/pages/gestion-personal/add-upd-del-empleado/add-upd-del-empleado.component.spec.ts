import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddUpdDelEmpleadoComponent } from './add-upd-del-empleado.component';

describe('AddUpdDelEmpleadoComponent', () => {
  let component: AddUpdDelEmpleadoComponent;
  let fixture: ComponentFixture<AddUpdDelEmpleadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUpdDelEmpleadoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpdDelEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
