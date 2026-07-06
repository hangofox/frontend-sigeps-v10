import { TestBed } from '@angular/core/testing';
import { TiposMovimientosEmpleadosService } from './tiposMovimientosEmpleados.service';

describe('TiposMovimientosEmpleadosService', () => {
  let service: TiposMovimientosEmpleadosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TiposMovimientosEmpleadosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
