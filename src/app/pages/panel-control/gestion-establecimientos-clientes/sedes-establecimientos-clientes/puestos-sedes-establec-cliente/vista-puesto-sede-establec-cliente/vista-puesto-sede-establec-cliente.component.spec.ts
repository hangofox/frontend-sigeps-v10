import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VistaPuestoSedeEstablecClienteComponent } from './vista-puesto-sede-establec-cliente.component';

describe('VistaPuestoSedeEstablecClienteComponent', () => {
  let component: VistaPuestoSedeEstablecClienteComponent;
  let fixture: ComponentFixture<VistaPuestoSedeEstablecClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VistaPuestoSedeEstablecClienteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VistaPuestoSedeEstablecClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
