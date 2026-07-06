import { TestBed } from '@angular/core/testing';
import { NovedadesEmpleadosService } from './novedadesEmpleados.service';

describe('NovedadesEmpleadosService', () => {
  let service: NovedadesEmpleadosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NovedadesEmpleadosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
