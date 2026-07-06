import { TestBed } from '@angular/core/testing';
import { TokensCodigosActivacionesRecuperacionesContrasenasService } from './tokensCodigosActivacionesRecuperacionesContrasenas.service';

describe('TokensCodigosActivacionesRecuperacionesContrasenasService', () => {
  let service: TokensCodigosActivacionesRecuperacionesContrasenasService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokensCodigosActivacionesRecuperacionesContrasenasService);
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
