import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddUpdDelSedeEstablecClienteComponent } from './add-upd-del-sede-establec-cliente.component';

describe('AddUpdDelSedeEstablecClienteComponent', () => {
  let component: AddUpdDelSedeEstablecClienteComponent;
  let fixture: ComponentFixture<AddUpdDelSedeEstablecClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUpdDelSedeEstablecClienteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpdDelSedeEstablecClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
