import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListadoPuestosSedesEstablecClientesComponent } from './listado-puestos-sedes-establec-clientes.component';

describe('ListadoPuestosSedesEstablecClientesComponent', () => {
  let component: ListadoPuestosSedesEstablecClientesComponent;
  let fixture: ComponentFixture<ListadoPuestosSedesEstablecClientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListadoPuestosSedesEstablecClientesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoPuestosSedesEstablecClientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
