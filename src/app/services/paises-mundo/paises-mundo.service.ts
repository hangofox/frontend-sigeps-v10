import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponsePaisMundoDTO } from '../../interfaces/paises-mundo/responsePaisMundoDTO.interface';
import { PaisesMundoI, PaisesMundoMsj } from '../../interfaces/paises-mundo/paises-mundo.interface';

@Injectable({
  providedIn: 'root'
})
export class PaisesMundoService {
  
  //SI EL PROYECTO SE DESPLIEGA EN DESAROLLO ASIGNA LA IP DEL SERVIDOR DE DESARROLLO, SI EL PROYECTO SE DESPLIEGA EN PRUEBAS O PRODUCCIÓN TRAE LA IP DEL SERVIDOR DE PRUEBAS O PRODUCCIÓN:
  private baseUrl = environment.baseUrl;
  
  constructor(private http: HttpClient) {}
  
  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idPaisMundo?: number, keyword?: string): Observable<number> {
     let params = new HttpParams();
     if (idPaisMundo !== undefined) params = params.set('idPaisMundo', idPaisMundo.toString());
     if (keyword) params = params.set('keyword', keyword);
     return this.http.get<number>(`${this.baseUrl}/paisesMundo/count`, { params });
  }
  
  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllCountriesOfTheWorld(idPaisMundo?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<PaisesMundoI[]> {
     let params = new HttpParams().set('orderMode', orderMode);
     if (idPaisMundo !== undefined) params = params.set('idPaisMundo', idPaisMundo.toString());
     if (keyword) params = params.set('keyword', keyword);
     if (orderBy) params = params.set('orderBy', orderBy);
     return this.http.get<PaisesMundoI[]>(`${this.baseUrl}/paisesMundo/lista`, { params });
  }
  
  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllCountriesOfTheWorldPag(page: number = 0, size: number = 10, idPaisMundo?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<PaisesMundoI[]> {
     let params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('orderMode', orderMode);
     if (idPaisMundo !== undefined) params = params.set('idPaisMundo', idPaisMundo.toString());
     if (keyword) params = params.set('keyword', keyword);
     if (orderBy) params = params.set('orderBy', orderBy);
     return this.http.get<any>(`${this.baseUrl}/paisesMundo/listaPag`, { params }).pipe(
       map((slice: any) => slice.content as PaisesMundoI[])
     );
  }
  
  //CREAR REGISTRO.
  addCountryOfTheWorld(paisMundo: PaisesMundoI): Observable<PaisesMundoMsj> {
     return this.http.post<PaisesMundoMsj>(`${this.baseUrl}/paisesMundo`, paisMundo);
  }
  
  //CONSULTAR REGISTRO POR ID.
  getCountryOfTheWorldbyId(idPaisMundo: number): Observable<ResponsePaisMundoDTO> {
     return this.http.get<ResponsePaisMundoDTO>(`${this.baseUrl}/paisesMundo/${idPaisMundo}`);
  }
  
  //CONSULTAR REGISTRO POR NOMBRE.
  getCountryOfTheWorldbyNombre(nombrePaisMundo: string): Observable<ResponsePaisMundoDTO> {
     return this.http.get<ResponsePaisMundoDTO>(`${this.baseUrl}/paisesMundo/nombre/${nombrePaisMundo}`);
  }
  
  //MODIFICAR REGISTRO.
  updateCountryOfTheWorld(paisMundo: PaisesMundoI): Observable<PaisesMundoMsj> {
     return this.http.put<PaisesMundoMsj>(`${this.baseUrl}/paisesMundo`, paisMundo);
  }
  
  //ELIMINAR REGISTRO.
  deleteCountryOfTheWorld(idPaisMundo: number): Observable<PaisesMundoMsj> {
     return this.http.delete<PaisesMundoMsj>(`${this.baseUrl}/paisesMundo/${idPaisMundo}`);
  }
  
}
