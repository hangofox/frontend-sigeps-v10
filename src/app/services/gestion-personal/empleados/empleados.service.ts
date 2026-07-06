import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseEmpleadoDTO } from '../../../interfaces/gestion-personal/empleados/responseEmpleadoDTO.interface';
import { EmpleadosI } from '../../../interfaces/gestion-personal/empleados/empleados.interface';

@Injectable({
  providedIn: 'root'
})
export class EmpleadosService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(
    idEmpleado?: number,
    keyword?: string,
    nombreTipoDocumentoIdentificacion?: string,
    numeroDocumentoIdentificacionEmpleado?: string,
    nombresEmpleado?: string,
    primerApellidoEmpleado?: string
  ): Observable<number> {
    let params = new HttpParams();
    if (idEmpleado !== undefined)                 params = params.set('idEmpleado', idEmpleado.toString());
    if (keyword)                                  params = params.set('keyword', keyword);
    if (nombreTipoDocumentoIdentificacion)         params = params.set('nombreTipoDocumentoIdentificacion', nombreTipoDocumentoIdentificacion);
    if (numeroDocumentoIdentificacionEmpleado)     params = params.set('numeroDocumentoIdentificacionEmpleado', numeroDocumentoIdentificacionEmpleado);
    if (nombresEmpleado)                          params = params.set('nombresEmpleado', nombresEmpleado);
    if (primerApellidoEmpleado)                   params = params.set('primerApellidoEmpleado', primerApellidoEmpleado);
    return this.http.get<number>(`${this.baseUrl}/empleados/count`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllEmployees(
    idEmpleado?: number,
    keyword?: string,
    nombreTipoDocumentoIdentificacion?: string,
    numeroDocumentoIdentificacionEmpleado?: string,
    nombresEmpleado?: string,
    primerApellidoEmpleado?: string,
    orderBy?: string,
    orderMode: string = 'ASC'
  ): Observable<EmpleadosI[]> {
    let params = new HttpParams().set('orderMode', orderMode);
    if (idEmpleado !== undefined)                 params = params.set('idEmpleado', idEmpleado.toString());
    if (keyword)                                  params = params.set('keyword', keyword);
    if (nombreTipoDocumentoIdentificacion)         params = params.set('nombreTipoDocumentoIdentificacion', nombreTipoDocumentoIdentificacion);
    if (numeroDocumentoIdentificacionEmpleado)     params = params.set('numeroDocumentoIdentificacionEmpleado', numeroDocumentoIdentificacionEmpleado);
    if (nombresEmpleado)                          params = params.set('nombresEmpleado', nombresEmpleado);
    if (primerApellidoEmpleado)                   params = params.set('primerApellidoEmpleado', primerApellidoEmpleado);
    if (orderBy)                                  params = params.set('orderBy', orderBy);
    return this.http.get<EmpleadosI[]>(`${this.baseUrl}/empleados/lista`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllEmployeesPag(
    page: number = 0,
    size: number = 10,
    idEmpleado?: number,
    keyword?: string,
    nombreTipoDocumentoIdentificacion?: string,
    numeroDocumentoIdentificacionEmpleado?: string,
    nombresEmpleado?: string,
    primerApellidoEmpleado?: string,
    orderBy?: string,
    orderMode: string = 'ASC'
  ): Observable<EmpleadosI[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('orderMode', orderMode);
    if (idEmpleado !== undefined)                 params = params.set('idEmpleado', idEmpleado.toString());
    if (keyword)                                  params = params.set('keyword', keyword);
    if (nombreTipoDocumentoIdentificacion)         params = params.set('nombreTipoDocumentoIdentificacion', nombreTipoDocumentoIdentificacion);
    if (numeroDocumentoIdentificacionEmpleado)     params = params.set('numeroDocumentoIdentificacionEmpleado', numeroDocumentoIdentificacionEmpleado);
    if (nombresEmpleado)                          params = params.set('nombresEmpleado', nombresEmpleado);
    if (primerApellidoEmpleado)                   params = params.set('primerApellidoEmpleado', primerApellidoEmpleado);
    if (orderBy)                                  params = params.set('orderBy', orderBy);
    return this.http.get<any>(`${this.baseUrl}/empleados/listaPag`, { params }).pipe(
      map((slice: any) => slice.content as EmpleadosI[])
    );
  }

  //CREAR REGISTRO.
  addEmployee(empleado: EmpleadosI): Observable<ResponseEmpleadoDTO> {
    return this.http.post<ResponseEmpleadoDTO>(`${this.baseUrl}/empleados`, empleado);
  }

  //CONSULTAR REGISTRO POR ID.
  getEmployeebyId(idEmpleado: number): Observable<ResponseEmpleadoDTO> {
    return this.http.get<ResponseEmpleadoDTO>(`${this.baseUrl}/empleados/${idEmpleado}`);
  }

  //CONSULTAR REGISTRO POR NÚMERO DE DOCUMENTO DE IDENTIFICACIÓN.
  getEmployeebyNumeroDocumentoIdentificacion(numeroDocumentoIdentificacionEmpleado: string): Observable<ResponseEmpleadoDTO> {
    return this.http.get<ResponseEmpleadoDTO>(`${this.baseUrl}/empleados/numeroDocumentoIdentificacion/${numeroDocumentoIdentificacionEmpleado}`);
  }

  //MODIFICAR REGISTRO.
  updateEmployee(empleado: EmpleadosI): Observable<ResponseEmpleadoDTO> {
    return this.http.put<ResponseEmpleadoDTO>(`${this.baseUrl}/empleados`, empleado);
  }

  //ELIMINAR REGISTRO.
  deleteEmployee(idEmpleado: number): Observable<ResponseEmpleadoDTO> {
    return this.http.delete<ResponseEmpleadoDTO>(`${this.baseUrl}/empleados/${idEmpleado}`);
  }
}
