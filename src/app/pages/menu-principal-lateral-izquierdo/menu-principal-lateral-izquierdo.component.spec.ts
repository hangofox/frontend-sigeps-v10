import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuPrincipalLateralIzquierdoComponent } from './menu-principal-lateral-izquierdo.component';

describe('MenuPrincipalLateralIzquierdoComponent', () => {
  let component: MenuPrincipalLateralIzquierdoComponent;
  let fixture: ComponentFixture<MenuPrincipalLateralIzquierdoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuPrincipalLateralIzquierdoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuPrincipalLateralIzquierdoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
