import { TestBed } from '@angular/core/testing';
import { TiposTarifasEmpleadosService } from './tipos-tarifas-empleados.service';

describe('TiposTarifasEmpleadosService', () => {
  let service: TiposTarifasEmpleadosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TiposTarifasEmpleadosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
