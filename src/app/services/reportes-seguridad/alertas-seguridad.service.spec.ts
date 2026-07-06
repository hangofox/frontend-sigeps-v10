import { TestBed } from '@angular/core/testing';
import { AlertasSeguridadService } from './alertas-seguridad.service';

describe('AlertasSeguridadService', () => {
  let service: AlertasSeguridadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertasSeguridadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
