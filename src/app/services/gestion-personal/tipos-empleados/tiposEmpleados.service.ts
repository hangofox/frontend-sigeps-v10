import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseTipoEmpleadoDTO } from '../../../interfaces/gestion-personal/tipos-empleados/responseTipoEmpleadoDTO.interface';
import { TipoEmpleadoI, TipoEmpleadoMsj } from '../../../interfaces/gestion-personal/tipos-empleados/tipos-empleados.interface';

@Injectable({
  providedIn: 'root'
})
export class TiposEmpleadosService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idTipoEmpleado?: number, keyword?: string): Observable<number> {
    let params = new HttpParams();
    if (idTipoEmpleado !== undefined) params = params.set('idTipoEmpleado', idTipoEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    return this.http.get<number>(`${this.baseUrl}/tiposEmpleados/count`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllTypesOfEmployees(idTipoEmpleado?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<TipoEmpleadoI[]> {
    let params = new HttpParams().set('orderMode', orderMode);
    if (idTipoEmpleado !== undefined) params = params.set('idTipoEmpleado', idTipoEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<TipoEmpleadoI[]>(`${this.baseUrl}/tiposEmpleados/lista`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllTypesOfEmployeesPag(page: number = 0, size: number = 10, idTipoEmpleado?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<TipoEmpleadoI[]> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('orderMode', orderMode);
    if (idTipoEmpleado !== undefined) params = params.set('idTipoEmpleado', idTipoEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<any>(`${this.baseUrl}/tiposEmpleados/listaPag`, { params }).pipe(
      map((slice: any) => slice.content as TipoEmpleadoI[])
    );
  }

  //CREAR REGISTRO.
  addTypeOfEmployee(tipoEmpleado: TipoEmpleadoI): Observable<TipoEmpleadoMsj> {
    return this.http.post<TipoEmpleadoMsj>(`${this.baseUrl}/tiposEmpleados`, tipoEmpleado);
  }

  //CONSULTAR REGISTRO POR ID.
  getTypeOfEmployeebyId(idTipoEmpleado: number): Observable<ResponseTipoEmpleadoDTO> {
    return this.http.get<ResponseTipoEmpleadoDTO>(`${this.baseUrl}/tiposEmpleados/${idTipoEmpleado}`);
  }

  //CONSULTAR REGISTRO POR NOMBRE.
  getTypeOfEmployeebyNombre(nombreTipoEmpleado: string): Observable<ResponseTipoEmpleadoDTO> {
    return this.http.get<ResponseTipoEmpleadoDTO>(`${this.baseUrl}/tiposEmpleados/nombre/${nombreTipoEmpleado}`);
  }

  //MODIFICAR REGISTRO.
  updateTypeOfEmployee(tipoEmpleado: TipoEmpleadoI): Observable<TipoEmpleadoMsj> {
    return this.http.put<TipoEmpleadoMsj>(`${this.baseUrl}/tiposEmpleados`, tipoEmpleado);
  }

  //ELIMINAR REGISTRO.
  deleteTypeOfEmployee(idTipoEmpleado: number): Observable<TipoEmpleadoMsj> {
    return this.http.delete<TipoEmpleadoMsj>(`${this.baseUrl}/tiposEmpleados/${idTipoEmpleado}`);
  }

}
