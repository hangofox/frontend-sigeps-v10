import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseTipoNovedadEmpleadoDTO } from '../../../interfaces/gestion-personal/tipos-novedades-empleados/responseTipoNovedadEmpleadoDTO.interface';
import { TipoNovedadEmpleadoI, TipoNovedadEmpleadoMsj } from '../../../interfaces/gestion-personal/tipos-novedades-empleados/tipos-novedades-empleados.interface';

@Injectable({
  providedIn: 'root'
})
export class TiposNovedadesEmpleadosService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idTipoNovedadEmpleado?: number, keyword?: string): Observable<number> {
    let params = new HttpParams();
    if (idTipoNovedadEmpleado !== undefined) params = params.set('idTipoNovedadEmpleado', idTipoNovedadEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    return this.http.get<number>(`${this.baseUrl}/tiposNovedadesEmpleados/count`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllTypesOfEmployeeIncidents(idTipoNovedadEmpleado?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<TipoNovedadEmpleadoI[]> {
    let params = new HttpParams().set('orderMode', orderMode);
    if (idTipoNovedadEmpleado !== undefined) params = params.set('idTipoNovedadEmpleado', idTipoNovedadEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<TipoNovedadEmpleadoI[]>(`${this.baseUrl}/tiposNovedadesEmpleados/lista`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllTypesOfEmployeeIncidentsPag(page: number = 0, size: number = 10, idTipoNovedadEmpleado?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<TipoNovedadEmpleadoI[]> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('orderMode', orderMode);
    if (idTipoNovedadEmpleado !== undefined) params = params.set('idTipoNovedadEmpleado', idTipoNovedadEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<any>(`${this.baseUrl}/tiposNovedadesEmpleados/listaPag`, { params }).pipe(
      map((slice: any) => slice.content as TipoNovedadEmpleadoI[])
    );
  }

  //CREAR REGISTRO.
  addTypeOfEmployeeIncident(tipoNovedadEmpleado: TipoNovedadEmpleadoI): Observable<TipoNovedadEmpleadoMsj> {
    return this.http.post<TipoNovedadEmpleadoMsj>(`${this.baseUrl}/tiposNovedadesEmpleados`, tipoNovedadEmpleado);
  }

  //CONSULTAR REGISTRO POR ID.
  getTypeOfEmployeeIncidentbyId(idTipoNovedadEmpleado: number): Observable<ResponseTipoNovedadEmpleadoDTO> {
    return this.http.get<ResponseTipoNovedadEmpleadoDTO>(`${this.baseUrl}/tiposNovedadesEmpleados/${idTipoNovedadEmpleado}`);
  }

  //CONSULTAR REGISTRO POR NOMBRE.
  getTypeOfEmployeeIncidentbyNombre(nombreTipoNovedadEmpleado: string): Observable<ResponseTipoNovedadEmpleadoDTO> {
    return this.http.get<ResponseTipoNovedadEmpleadoDTO>(`${this.baseUrl}/tiposNovedadesEmpleados/nombre/${nombreTipoNovedadEmpleado}`);
  }

  //MODIFICAR REGISTRO.
  updateTypeOfEmployeeIncident(tipoNovedadEmpleado: TipoNovedadEmpleadoI): Observable<TipoNovedadEmpleadoMsj> {
    return this.http.put<TipoNovedadEmpleadoMsj>(`${this.baseUrl}/tiposNovedadesEmpleados`, tipoNovedadEmpleado);
  }

  //ELIMINAR REGISTRO.
  deleteTypeOfEmployeeIncident(idTipoNovedadEmpleado: number): Observable<TipoNovedadEmpleadoMsj> {
    return this.http.delete<TipoNovedadEmpleadoMsj>(`${this.baseUrl}/tiposNovedadesEmpleados/${idTipoNovedadEmpleado}`);
  }

}
