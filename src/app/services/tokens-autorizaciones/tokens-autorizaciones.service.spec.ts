import { TestBed } from '@angular/core/testing';
import { TokensAutorizacionesService } from './tokens-autorizaciones.service';

describe('TokensAutorizacionesService', () => {
  let service: TokensAutorizacionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokensAutorizacionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
