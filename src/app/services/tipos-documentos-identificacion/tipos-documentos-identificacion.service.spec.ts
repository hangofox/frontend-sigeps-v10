import { TestBed } from '@angular/core/testing';
import { TiposDocumentosIdentificacionService } from './tipos-documentos-identificacion.service';

describe('TiposDocumentosIdentificacionService', () => {
  let service: TiposDocumentosIdentificacionService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TiposDocumentosIdentificacionService);
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
