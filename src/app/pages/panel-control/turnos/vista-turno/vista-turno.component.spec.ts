import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VistaTurnoComponent } from './vista-turno.component';

describe('VistaTurnoComponent', () => {
  let component: VistaTurnoComponent;
  let fixture: ComponentFixture<VistaTurnoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VistaTurnoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VistaTurnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
