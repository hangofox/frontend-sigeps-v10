import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListadoEstablecimientosClientesComponent } from './listado-establecimientos-clientes.component';

describe('ListadoEstablecimientosClientesComponent', () => {
  let component: ListadoEstablecimientosClientesComponent;
  let fixture: ComponentFixture<ListadoEstablecimientosClientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListadoEstablecimientosClientesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoEstablecimientosClientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
