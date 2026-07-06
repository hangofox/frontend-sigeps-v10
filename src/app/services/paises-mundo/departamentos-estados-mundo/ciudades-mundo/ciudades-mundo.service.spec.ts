import { TestBed } from '@angular/core/testing';
import { CiudadesMundoService } from './ciudades-mundo.service';

describe('CiudadesMundoService', () => {
  let service: CiudadesMundoService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CiudadesMundoService);
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});