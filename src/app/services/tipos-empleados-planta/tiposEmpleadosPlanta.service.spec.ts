import { TestBed } from '@angular/core/testing';
import { TiposEmpleadosPlantaService } from './tiposEmpleadosPlanta.service';

describe('TiposEmpleadosPlantaService', () => {
  let service: TiposEmpleadosPlantaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TiposEmpleadosPlantaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
