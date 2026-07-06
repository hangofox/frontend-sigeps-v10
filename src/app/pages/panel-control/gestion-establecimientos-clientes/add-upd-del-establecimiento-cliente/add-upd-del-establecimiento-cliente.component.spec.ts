import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddUpdDelEstablecimientoClienteComponent } from './add-upd-del-establecimiento-cliente.component';

describe('AddUpdDelEstablecimientoClienteComponent', () => {
  let component: AddUpdDelEstablecimientoClienteComponent;
  let fixture: ComponentFixture<AddUpdDelEstablecimientoClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUpdDelEstablecimientoClienteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpdDelEstablecimientoClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
