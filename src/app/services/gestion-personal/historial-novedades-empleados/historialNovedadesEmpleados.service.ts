import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseHistorialNovedadEmpleadoDTO } from '../../../interfaces/gestion-personal/historial-novedades-empleados/responseHistorialNovedadEmpleadoDTO.interface';
import { HistorialNovedadesEmpleadosI } from '../../../interfaces/gestion-personal/historial-novedades-empleados/historialNovedadesEmpleados.interface';

@Injectable({
  providedIn: 'root'
})
export class NovedadesEmpleadosService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idHistorialNovedadEmpleado?: number, keyword?: string): Observable<number> {
    let params = new HttpParams();
    if (idHistorialNovedadEmpleado !== undefined) params = params.set('idHistorialNovedadEmpleado', idHistorialNovedadEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    return this.http.get<number>(`${this.baseUrl}/historialesNovedadesEmpleados/count`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllEmployeeIncidentHistories(
    idHistorialNovedadEmpleado?: number,
    keyword?: string,
    orderBy?: string,
    orderMode: string = 'ASC'
  ): Observable<HistorialNovedadesEmpleadosI[]> {
    let params = new HttpParams().set('orderMode', orderMode);
    if (idHistorialNovedadEmpleado !== undefined) params = params.set('idHistorialNovedadEmpleado', idHistorialNovedadEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<HistorialNovedadesEmpleadosI[]>(`${this.baseUrl}/historialesNovedadesEmpleados/lista`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllEmployeeIncidentHistoriesPag(
    page: number = 0,
    size: number = 10,
    idHistorialNovedadEmpleado?: number,
    keyword?: string,
    orderBy?: string,
    orderMode: string = 'ASC'
  ): Observable<HistorialNovedadesEmpleadosI[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('orderMode', orderMode);
    if (idHistorialNovedadEmpleado !== undefined) params = params.set('idHistorialNovedadEmpleado', idHistorialNovedadEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<any>(`${this.baseUrl}/historialesNovedadesEmpleados/listaPag`, { params }).pipe(
      map((slice: any) => slice.content as HistorialNovedadesEmpleadosI[])
    );
  }

  //CREAR REGISTRO.
  addEmployeeIncidentHistory(novedad: HistorialNovedadesEmpleadosI): Observable<ResponseHistorialNovedadEmpleadoDTO> {
    return this.http.post<ResponseHistorialNovedadEmpleadoDTO>(`${this.baseUrl}/historialesNovedadesEmpleados`, novedad);
  }

  //MODIFICAR REGISTRO.
  updateEmployeeIncidentHistory(novedad: HistorialNovedadesEmpleadosI): Observable<ResponseHistorialNovedadEmpleadoDTO> {
    return this.http.put<ResponseHistorialNovedadEmpleadoDTO>(`${this.baseUrl}/historialesNovedadesEmpleados`, novedad);
  }

  //ELIMINAR REGISTRO.
  deleteEmployeeIncidentHistory(id: number): Observable<ResponseHistorialNovedadEmpleadoDTO> {
    return this.http.delete<ResponseHistorialNovedadEmpleadoDTO>(`${this.baseUrl}/historialesNovedadesEmpleados/${id}`);
  }

  //CONSULTAR REGISTRO POR NÚMERO DE DOCUMENTO Y DESCRIPCIÓN.
  getEmployeeIncidentHistorybyNumeroDocumentoAndDescripcion(
    numeroDocumentoIdentificacion: string,
    descripcion: string
  ): Observable<ResponseHistorialNovedadEmpleadoDTO> {
    return this.http.get<ResponseHistorialNovedadEmpleadoDTO>(
      `${this.baseUrl}/historialesNovedadesEmpleados/numeroDocumentoIdentificacion/${numeroDocumentoIdentificacion}/descripcion/${descripcion}`
    );
  }
}
