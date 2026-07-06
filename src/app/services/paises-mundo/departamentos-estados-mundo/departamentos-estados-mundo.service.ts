import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseDepartamentooEstadoMundoDTO } from '../../../interfaces/paises-mundo/departamentos-estados-mundo/responseDepartamentosoEstadosMundoDTO.interface';
import { DepartamentosoEstadosMundoI, DepartamentosoEstadosMundoMsj } from '../../../interfaces/paises-mundo/departamentos-estados-mundo/departamentos-estados-mundo.interface';

@Injectable({
  providedIn: 'root'
})
export class DepartamentosoEstadosMundoService {
  
  //SI EL PROYECTO SE DESPLIEGA EN DESAROLLO ASIGNA LA IP DEL SERVIDOR DE DESARROLLO, SI EL PROYECTO SE DESPLIEGA EN PRUEBAS O PRODUCCIÓN TRAE LA IP DEL SERVIDOR DE PRUEBAS O PRODUCCIÓN:
  private baseUrl = environment.baseUrl;
  
  constructor(private http: HttpClient) {}
  
  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idPaisMundo?: number, nombrePaisMundo?: string, keyword?: string): Observable<number> {
     let params = new HttpParams();
     if (idPaisMundo !== undefined) params = params.set('idPaisMundo', idPaisMundo.toString());
     if (nombrePaisMundo) params = params.set('nombrePaisMundo', nombrePaisMundo);
     if (keyword) params = params.set('keyword', keyword);
     return this.http.get<number>(`${this.baseUrl}/departamentosoEstadosMundo/count`, { params });
  }
  
  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllDepartmentsOrStatesOfTheWorld(idPaisMundo?: number, nombrePaisMundo?: string, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<DepartamentosoEstadosMundoI[]> {
     let params = new HttpParams().set('orderMode', orderMode);
     if (idPaisMundo !== undefined) params = params.set('idPaisMundo', idPaisMundo.toString());
     if (nombrePaisMundo) params = params.set('nombrePaisMundo', nombrePaisMundo);
     if (keyword) params = params.set('keyword', keyword);
     if (orderBy) params = params.set('orderBy', orderBy);
     return this.http.get<DepartamentosoEstadosMundoI[]>(`${this.baseUrl}/departamentosoEstadosMundo/lista`, { params });
  }
  
  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllDepartmentsOrStatesOfTheWorldPag(page: number = 0, size: number = 10, idPaisMundo?: number, nombrePaisMundo?: string, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<DepartamentosoEstadosMundoI[]> {
     let params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('orderMode', orderMode);
     if (idPaisMundo !== undefined) params = params.set('idPaisMundo', idPaisMundo.toString());
     if (nombrePaisMundo) params = params.set('nombrePaisMundo', nombrePaisMundo);
     if (keyword) params = params.set('keyword', keyword);
     if (orderBy) params = params.set('orderBy', orderBy);
     return this.http.get<any>(`${this.baseUrl}/departamentosoEstadosMundo/listaPag`, { params }).pipe(
       map((slice: any) => slice.content as DepartamentosoEstadosMundoI[])
     );
  }
  
  //CREAR REGISTRO.
  addDepartmentOrStateOfTheWorld(departamento: DepartamentosoEstadosMundoI): Observable<DepartamentosoEstadosMundoMsj> {
     return this.http.post<DepartamentosoEstadosMundoMsj>(`${this.baseUrl}/departamentosoEstadosMundo`, departamento);
  }
  
  //CONSULTAR REGISTRO POR ID.
  getDepartmentOrStateOfTheWorldbyId(idDepartamentooEstadoMundo: number): Observable<ResponseDepartamentooEstadoMundoDTO> {
     return this.http.get<ResponseDepartamentooEstadoMundoDTO>(`${this.baseUrl}/departamentosoEstadosMundo/${idDepartamentooEstadoMundo}`);
  }
  
  //CONSULTAR REGISTRO POR ID DEL PAIS E ID DEL DEPARTAMENTO O ESTADO.
  getDepartmentOrStateOfTheWorldbyIdPaisMundoAndIdDepartamentooEstadoMundo(idPaisMundo: number, idDepartamentooEstadoMundo: number): Observable<ResponseDepartamentooEstadoMundoDTO> {
     return this.http.get<ResponseDepartamentooEstadoMundoDTO>(`${this.baseUrl}/departamentosoEstadosMundo/idPaisMundo/${idPaisMundo}/idDepartamentooEstadoMundo/${idDepartamentooEstadoMundo}`);
  }
  
  //CONSULTAR REGISTRO POR NOMBRE DEL PAIS Y NOMBRE DEL DEPARTAMENTO O ESTADO.
  getDepartmentOrStateOfTheWorldbyNombrePaisMundoAndNombreDepartamentooEstadoMundo(nombrePaisMundo: string, nombreDepartamentooEstadoMundo: string): Observable<ResponseDepartamentooEstadoMundoDTO> {
     return this.http.get<ResponseDepartamentooEstadoMundoDTO>(`${this.baseUrl}/departamentosoEstadosMundo/nombrePaisMundo/${nombrePaisMundo}/nombreDepartamentooEstadoMundo/${nombreDepartamentooEstadoMundo}`);
  }
  
  //MODIFICAR REGISTRO.
  updateDepartmentOrStateOfTheWorld(departamento: DepartamentosoEstadosMundoI): Observable<DepartamentosoEstadosMundoMsj> {
     return this.http.put<DepartamentosoEstadosMundoMsj>(`${this.baseUrl}/departamentosoEstadosMundo`, departamento);
  }
  
  //ELIMINAR REGISTRO.
  deleteDepartmentOrStateOfTheWorld(idDepartamentooEstadoMundo: number): Observable<DepartamentosoEstadosMundoMsj> {
     return this.http.delete<DepartamentosoEstadosMundoMsj>(`${this.baseUrl}/departamentosoEstadosMundo/${idDepartamentooEstadoMundo}`);
  }
  
}
