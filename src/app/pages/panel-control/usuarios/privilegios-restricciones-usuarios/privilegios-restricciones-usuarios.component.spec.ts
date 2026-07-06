import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrivilegiosyRestriccionesUsuariosComponent } from './privilegios-restricciones-usuarios.component';

describe('PrivilegiosyRestriccionesUsuariosComponent', () => {
  let component: PrivilegiosyRestriccionesUsuariosComponent;
  let fixture: ComponentFixture<PrivilegiosyRestriccionesUsuariosComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrivilegiosyRestriccionesUsuariosComponent ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrivilegiosyRestriccionesUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
