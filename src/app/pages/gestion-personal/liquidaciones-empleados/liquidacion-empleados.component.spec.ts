import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LiquidacionEmpleadosComponent } from './liquidacion-empleados.component';

describe('LiquidacionEmpleadosComponent', () => {
  let component: LiquidacionEmpleadosComponent;
  let fixture: ComponentFixture<LiquidacionEmpleadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiquidacionEmpleadosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiquidacionEmpleadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
