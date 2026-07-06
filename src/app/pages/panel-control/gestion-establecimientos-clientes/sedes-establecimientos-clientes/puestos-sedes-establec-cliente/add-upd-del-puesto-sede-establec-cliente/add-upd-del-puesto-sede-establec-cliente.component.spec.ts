import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddUpdDelPuestoSedeEstablecClienteComponent } from './add-upd-del-puesto-sede-establec-cliente.component';

describe('AddUpdDelPuestoSedeEstablecClienteComponent', () => {
  let component: AddUpdDelPuestoSedeEstablecClienteComponent;
  let fixture: ComponentFixture<AddUpdDelPuestoSedeEstablecClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUpdDelPuestoSedeEstablecClienteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpdDelPuestoSedeEstablecClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
