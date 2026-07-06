import { TestBed } from '@angular/core/testing';
import { RecuperacionesContrasenasAccesosUsuariosService } from './recuperacionesContrasenasAccesosUsuarios.service';

describe('RecuperacionesContrasenasAccesosUsuariosService', () => {
  let service: RecuperacionesContrasenasAccesosUsuariosService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecuperacionesContrasenasAccesosUsuariosService);
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
