import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddUpdDelUsuarioComponent } from './add-upd-del-usuario.component';

describe('AddUpdDelUsuarioComponent', () => {
  let component: AddUpdDelUsuarioComponent;
  let fixture: ComponentFixture<AddUpdDelUsuarioComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUpdDelUsuarioComponent ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddUpdDelUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
