import { TestBed } from '@angular/core/testing';
import { TiposEmpleadosService } from './tiposEmpleados.service';

describe('TiposEmpleadosService', () => {
  let service: TiposEmpleadosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TiposEmpleadosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
