import { TestBed } from '@angular/core/testing';
import { PaisesMundoService } from './paises-mundo.service';

describe('PaisesMundoService', () => {
  let service: PaisesMundoService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaisesMundoService);
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});