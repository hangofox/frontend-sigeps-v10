import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListadoSedesEstablecClientesComponent } from './listado-sedes-establec-clientes.component';

describe('ListadoSedesEstablecClientesComponent', () => {
  let component: ListadoSedesEstablecClientesComponent;
  let fixture: ComponentFixture<ListadoSedesEstablecClientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListadoSedesEstablecClientesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoSedesEstablecClientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
