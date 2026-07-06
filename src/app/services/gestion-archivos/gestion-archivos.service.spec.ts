import { TestBed } from '@angular/core/testing';
import { GestionArchivosService} from './gestion-archivos.service';

describe('GestionArchivosService', () => {
  let service: GestionArchivosService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GestionArchivosService);
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
