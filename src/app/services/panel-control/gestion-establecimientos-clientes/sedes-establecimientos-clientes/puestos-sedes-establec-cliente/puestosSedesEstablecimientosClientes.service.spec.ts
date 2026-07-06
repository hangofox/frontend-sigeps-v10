import { TestBed } from '@angular/core/testing';
import { PuestosSedesEstablecimientosClientesService } from './puestosSedesEstablecimientosClientes.service';

describe('PuestosSedesEstablecimientosClientesService', () => {
  let service: PuestosSedesEstablecimientosClientesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PuestosSedesEstablecimientosClientesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
