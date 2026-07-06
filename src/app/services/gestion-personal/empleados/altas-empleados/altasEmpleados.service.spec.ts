import { TestBed } from '@angular/core/testing';
import { AltasEmpleadosService } from './altasEmpleados.service';

describe('AltasEmpleadosService', () => {
  let service: AltasEmpleadosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AltasEmpleadosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
