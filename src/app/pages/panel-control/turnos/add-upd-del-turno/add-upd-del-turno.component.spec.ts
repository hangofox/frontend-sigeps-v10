import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddUpdDelTurnoComponent } from './add-upd-del-turno.component';

describe('AddUpdDelTurnoComponent', () => {
  let component: AddUpdDelTurnoComponent;
  let fixture: ComponentFixture<AddUpdDelTurnoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUpdDelTurnoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpdDelTurnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
