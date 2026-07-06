import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VistaEstablecimientoClienteComponent } from './vista-establecimiento-cliente.component';

describe('VistaEstablecimientoClienteComponent', () => {
  let component: VistaEstablecimientoClienteComponent;
  let fixture: ComponentFixture<VistaEstablecimientoClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VistaEstablecimientoClienteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VistaEstablecimientoClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
