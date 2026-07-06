import { TestBed } from '@angular/core/testing';
import { LiquidacionesEmpleadosService } from './liquidacionesEmpleados.service';

describe('LiquidacionesEmpleadosService', () => {
  let service: LiquidacionesEmpleadosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LiquidacionesEmpleadosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
