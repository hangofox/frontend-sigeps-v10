import { TestBed } from '@angular/core/testing';
import { FuncionalidadesService } from './funcionalidades.service';

describe('FuncionalidadesService', () => {
  let service: FuncionalidadesService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FuncionalidadesService);
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});