import { TestBed } from '@angular/core/testing';
import { TarifasEmpleadosService } from './tarifas-empleados.service';

describe('TarifasEmpleadosService', () => {
  let service: TarifasEmpleadosService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TarifasEmpleadosService);
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
