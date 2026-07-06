import { TestBed } from '@angular/core/testing';
import { AuditoriasSistemaService } from './auditorias-sistema.service';

describe('AuditoriasSistemaService', () => {
  let service: AuditoriasSistemaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuditoriasSistemaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
