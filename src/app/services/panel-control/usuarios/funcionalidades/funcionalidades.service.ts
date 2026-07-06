import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseFuncionalidadDTO } from '../../../../interfaces/panel-control/usuarios/funcionalidades/responseFuncionalidadDTO.interface';
import { FuncionalidadesI, FuncionalidadesMsj } from '../../../../interfaces/panel-control/usuarios/funcionalidades/funcionalidades.interface';

@Injectable({
  providedIn: 'root'
})
export class FuncionalidadesService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idFuncionalidad?: number, keyword?: string): Observable<number> {
    let params = new HttpParams();
    if (idFuncionalidad !== undefined) params = params.set('idFuncionalidad', idFuncionalidad.toString());
    if (keyword) params = params.set('keyword', keyword);
    return this.http.get<number>(`${this.baseUrl}/funcionalidades/count`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllFunctionalities(idFuncionalidad?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<FuncionalidadesI[]> {
    let params = new HttpParams().set('orderMode', orderMode);
    if (idFuncionalidad !== undefined) params = params.set('idFuncionalidad', idFuncionalidad.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<FuncionalidadesI[]>(`${this.baseUrl}/funcionalidades/lista`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllFunctionalitiesPag(page: number = 0, size: number = 10, idFuncionalidad?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<FuncionalidadesI[]> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('orderMode', orderMode);
    if (idFuncionalidad !== undefined) params = params.set('idFuncionalidad', idFuncionalidad.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<any>(`${this.baseUrl}/funcionalidades/listaPag`, { params }).pipe(
      map((slice: any) => slice.content as FuncionalidadesI[])
    );
  }

  //CREAR REGISTRO.
  addFunctionality(funcionalidad: FuncionalidadesI): Observable<FuncionalidadesMsj> {
    return this.http.post<FuncionalidadesMsj>(`${this.baseUrl}/funcionalidades`, funcionalidad);
  }

  //CONSULTAR REGISTRO POR ID.
  getFunctionalitybyId(idFuncionalidad: number): Observable<ResponseFuncionalidadDTO> {
    return this.http.get<ResponseFuncionalidadDTO>(`${this.baseUrl}/funcionalidades/${idFuncionalidad}`);
  }

  //CONSULTAR REGISTRO POR NOMBRE.
  getFunctionalitybyNombre(nombreFuncionalidad: string): Observable<ResponseFuncionalidadDTO> {
    return this.http.get<ResponseFuncionalidadDTO>(`${this.baseUrl}/funcionalidades/nombre/${nombreFuncionalidad}`);
  }

  //MODIFICAR REGISTRO.
  updateFunctionality(funcionalidad: FuncionalidadesI): Observable<FuncionalidadesMsj> {
    return this.http.put<FuncionalidadesMsj>(`${this.baseUrl}/funcionalidades`, funcionalidad);
  }

  //ELIMINAR REGISTRO.
  deleteFunctionality(idFuncionalidad: number): Observable<FuncionalidadesMsj> {
    return this.http.delete<FuncionalidadesMsj>(`${this.baseUrl}/funcionalidades/${idFuncionalidad}`);
  }

}
