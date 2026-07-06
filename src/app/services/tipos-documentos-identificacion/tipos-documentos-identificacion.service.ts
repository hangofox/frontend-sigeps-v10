import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseTipoDocumentoIdentificacionDTO } from '../../interfaces/tipos-documentos-identificacion/responseTipoDocumentoIdentificacionDTO.interface';
import { TiposDocumentosIdentificacionI, TiposDocumentosIdentificacionMsj } from '../../interfaces/tipos-documentos-identificacion/tipos-documentos-identificacion.interface';

@Injectable({
  providedIn: 'root'
})
export class TiposDocumentosIdentificacionService {
  
  //SI EL PROYECTO SE DESPLIEGA EN DESAROLLO ASIGNA LA IP DEL SERVIDOR DE DESARROLLO, SI EL PROYECTO SE DESPLIEGA EN PRUEBAS O PRODUCCIÓN TRAE LA IP DEL SERVIDOR DE PRUEBAS O PRODUCCIÓN:
  private baseUrl = environment.baseUrl;
  
  constructor(private http: HttpClient) {}
  
  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idTipoDocumentoIdentificacion?: number, keyword?: string): Observable<number> {
     let params = new HttpParams();
     if (idTipoDocumentoIdentificacion !== undefined) params = params.set('idTipoDocumentoIdentificacion', idTipoDocumentoIdentificacion.toString());
     if (keyword) params = params.set('keyword', keyword);
     return this.http.get<number>(`${this.baseUrl}/tiposDocumentosIdentificacion/count`, { params });
  }
  
  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllTypesOfIdentificationDocuments(idTipoDocumentoIdentificacion?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<TiposDocumentosIdentificacionI[]> {
     let params = new HttpParams().set('orderMode', orderMode);
     if (idTipoDocumentoIdentificacion !== undefined) params = params.set('idTipoDocumentoIdentificacion', idTipoDocumentoIdentificacion.toString());
     if (keyword) params = params.set('keyword', keyword);
     if (orderBy) params = params.set('orderBy', orderBy);
     return this.http.get<TiposDocumentosIdentificacionI[]>(`${this.baseUrl}/tiposDocumentosIdentificacion/lista`, { params });
  }
  
  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllTypesOfIdentificationDocumentsPag(page: number = 0, size: number = 10, idTipoDocumentoIdentificacion?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<TiposDocumentosIdentificacionI[]> {
     let params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('orderMode', orderMode);
     if (idTipoDocumentoIdentificacion !== undefined) params = params.set('idTipoDocumentoIdentificacion', idTipoDocumentoIdentificacion.toString());
     if (keyword) params = params.set('keyword', keyword);
     if (orderBy) params = params.set('orderBy', orderBy);
     return this.http.get<any>(`${this.baseUrl}/tiposDocumentosIdentificacion/listaPag`, { params }).pipe(
       map((slice: any) => slice.content as TiposDocumentosIdentificacionI[])
     );
  }
  
  //CREAR REGISTRO.
  addTypeOfIdentificationDocument(tipoDocumentoIdentificacion: TiposDocumentosIdentificacionI): Observable<TiposDocumentosIdentificacionMsj> {
     return this.http.post<TiposDocumentosIdentificacionMsj>(`${this.baseUrl}/tiposDocumentosIdentificacion`, tipoDocumentoIdentificacion);
  }
  
  //CONSULTAR REGISTRO POR ID.
  getTypeOfIdentificationDocumentbyId(idTipoDocumentoIdentificacion: number): Observable<ResponseTipoDocumentoIdentificacionDTO> {
     return this.http.get<ResponseTipoDocumentoIdentificacionDTO>(`${this.baseUrl}/tiposDocumentosIdentificacion/${idTipoDocumentoIdentificacion}`);
  }
  
  //CONSULTAR REGISTRO POR NOMBRE.
  getTypeOfIdentificationDocumentbyNombre(nombreTipoDocumentoIdentificacion: string): Observable<ResponseTipoDocumentoIdentificacionDTO> {
     return this.http.get<ResponseTipoDocumentoIdentificacionDTO>(`${this.baseUrl}/tiposDocumentosIdentificacion/nombre/${nombreTipoDocumentoIdentificacion}`);
  }
  
  //MODIFICAR REGISTRO.
  updateTypeOfIdentificationDocument(tipoDocumentoIdentificacion: TiposDocumentosIdentificacionI): Observable<TiposDocumentosIdentificacionMsj> {
     return this.http.put<TiposDocumentosIdentificacionMsj>(`${this.baseUrl}/tiposDocumentosIdentificacion`, tipoDocumentoIdentificacion);
  }
  
  //ELIMINAR REGISTRO.
  deleteTypeOfIdentificationDocument(idTipoDocumentoIdentificacion: number): Observable<TiposDocumentosIdentificacionMsj> {
     return this.http.delete<TiposDocumentosIdentificacionMsj>(`${this.baseUrl}/tiposDocumentosIdentificacion/${idTipoDocumentoIdentificacion}`);
  }
  
}
