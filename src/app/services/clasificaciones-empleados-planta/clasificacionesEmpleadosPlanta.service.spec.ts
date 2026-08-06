import { TestBed } from '@angular/core/testing';
import { ClasificacionesEmpleadosPlantaService } from './clasificacionesEmpleadosPlanta.service';

describe('ClasificacionesEmpleadosPlantaService', () => {
  let service: ClasificacionesEmpleadosPlantaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClasificacionesEmpleadosPlantaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
