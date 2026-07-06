import { TestBed } from '@angular/core/testing';
import { EstablecimientosClientesService } from './establecimientosClientes.service';

describe('EstablecimientosClientesService', () => {
  let service: EstablecimientosClientesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstablecimientosClientesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
