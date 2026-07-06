import { TestBed } from '@angular/core/testing';
import { SubclasificacionesEmpleadosPlantaService } from './subclasificacionesEmpleadosPlanta.service';

describe('SubclasificacionesEmpleadosPlantaService', () => {
  let service: SubclasificacionesEmpleadosPlantaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubclasificacionesEmpleadosPlantaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
