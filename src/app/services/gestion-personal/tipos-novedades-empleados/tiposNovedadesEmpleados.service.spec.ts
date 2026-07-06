import { TestBed } from '@angular/core/testing';
import { TiposNovedadesEmpleadosService } from './tiposNovedadesEmpleados.service';

describe('TiposNovedadesEmpleadosService', () => {
  let service: TiposNovedadesEmpleadosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TiposNovedadesEmpleadosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
