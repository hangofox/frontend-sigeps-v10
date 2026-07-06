import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VistaSedeEstablecClienteComponent } from './vista-sede-establec-cliente.component';

describe('VistaSedeEstablecClienteComponent', () => {
  let component: VistaSedeEstablecClienteComponent;
  let fixture: ComponentFixture<VistaSedeEstablecClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VistaSedeEstablecClienteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VistaSedeEstablecClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
