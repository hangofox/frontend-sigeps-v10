import { TestBed } from '@angular/core/testing';
import { DepartamentosoEstadosMundoService } from './departamentos-estados-mundo.service';

describe('DepartamentosoEstadosMundoService', () => {
  let service: DepartamentosoEstadosMundoService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DepartamentosoEstadosMundoService);
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});