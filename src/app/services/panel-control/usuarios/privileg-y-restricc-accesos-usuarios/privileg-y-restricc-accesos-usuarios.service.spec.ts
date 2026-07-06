import { TestBed } from '@angular/core/testing';
import { PrivilegyRestriccAccesosUsuariosService } from './privileg-y-restricc-accesos-usuarios.service';

describe('PrivilegyRestriccAccesosUsuariosService', () => {
  let service: PrivilegyRestriccAccesosUsuariosService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrivilegyRestriccAccesosUsuariosService);
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});