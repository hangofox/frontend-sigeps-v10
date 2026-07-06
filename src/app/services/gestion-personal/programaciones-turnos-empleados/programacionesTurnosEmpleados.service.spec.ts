import { TestBed } from '@angular/core/testing';
import { ProgramacionesTurnosEmpleadosService } from './programacionesTurnosEmpleados.service';

describe('ProgramacionesTurnosEmpleadosService', () => {
  let service: ProgramacionesTurnosEmpleadosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProgramacionesTurnosEmpleadosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
