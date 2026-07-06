import { TestBed } from '@angular/core/testing';
import { SedesEstablecimientosClientesService } from './sedesEstablecimientosClientes.service';

describe('SedesEstablecimientosClientesService', () => {
  let service: SedesEstablecimientosClientesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SedesEstablecimientosClientesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
