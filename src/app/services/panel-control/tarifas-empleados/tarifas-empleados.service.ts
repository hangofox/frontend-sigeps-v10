import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseTarifaEmpleadoDTO } from '../../../interfaces/panel-control/tarifas-empleados/responseTarifaEmpleadoDTO.interface';
import { TarifasEmpleadosI, TarifasEmpleadosMsj } from '../../../interfaces/panel-control/tarifas-empleados/tarifas-empleados.interface';

@Injectable({
  providedIn: 'root'
})
export class TarifasEmpleadosService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idTarifaEmpleado?: number, keyword?: string, idTipoEmpleado?: number, idTipoEmpleadoPlanta?: number, idClasificacionEmpleadoPlanta?: number, idSubclasificacionEmpleadoPlanta?: number, idTipoTarifaEmpleado?: number, anioTarifaEmpleado?: number, estadoTarifaEmpleado?: string): Observable<number> {
    let params = new HttpParams();
    if (idTarifaEmpleado !== undefined) params = params.set('idTarifaEmpleado', idTarifaEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (idTipoEmpleado !== undefined) params = params.set('idTipoEmpleado', idTipoEmpleado.toString());
    if (idTipoEmpleadoPlanta !== undefined) params = params.set('idTipoEmpleadoPlanta', idTipoEmpleadoPlanta.toString());
    if (idClasificacionEmpleadoPlanta !== undefined) params = params.set('idClasificacionEmpleadoPlanta', idClasificacionEmpleadoPlanta.toString());
    if (idSubclasificacionEmpleadoPlanta !== undefined) params = params.set('idSubclasificacionEmpleadoPlanta', idSubclasificacionEmpleadoPlanta.toString());
    if (idTipoTarifaEmpleado !== undefined) params = params.set('idTipoTarifaEmpleado', idTipoTarifaEmpleado.toString());
    if (anioTarifaEmpleado !== undefined) params = params.set('anioTarifaEmpleado', anioTarifaEmpleado.toString());
    if (estadoTarifaEmpleado) params = params.set('estadoTarifaEmpleado', estadoTarifaEmpleado);
    return this.http.get<number>(`${this.baseUrl}/tarifasEmpleados/count`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllEmployeeRates(idTarifaEmpleado?: number, keyword?: string, idTipoEmpleado?: number, idTipoEmpleadoPlanta?: number, idClasificacionEmpleadoPlanta?: number, idSubclasificacionEmpleadoPlanta?: number, idTipoTarifaEmpleado?: number, anioTarifaEmpleado?: number, estadoTarifaEmpleado?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<TarifasEmpleadosI[]> {
    let params = new HttpParams().set('orderMode', orderMode);
    if (idTarifaEmpleado !== undefined) params = params.set('idTarifaEmpleado', idTarifaEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (idTipoEmpleado !== undefined) params = params.set('idTipoEmpleado', idTipoEmpleado.toString());
    if (idTipoEmpleadoPlanta !== undefined) params = params.set('idTipoEmpleadoPlanta', idTipoEmpleadoPlanta.toString());
    if (idClasificacionEmpleadoPlanta !== undefined) params = params.set('idClasificacionEmpleadoPlanta', idClasificacionEmpleadoPlanta.toString());
    if (idSubclasificacionEmpleadoPlanta !== undefined) params = params.set('idSubclasificacionEmpleadoPlanta', idSubclasificacionEmpleadoPlanta.toString());
    if (idTipoTarifaEmpleado !== undefined) params = params.set('idTipoTarifaEmpleado', idTipoTarifaEmpleado.toString());
    if (anioTarifaEmpleado !== undefined) params = params.set('anioTarifaEmpleado', anioTarifaEmpleado.toString());
    if (estadoTarifaEmpleado) params = params.set('estadoTarifaEmpleado', estadoTarifaEmpleado);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<TarifasEmpleadosI[]>(`${this.baseUrl}/tarifasEmpleados/lista`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllEmployeeRatesPag(page: number = 0, size: number = 10, idTarifaEmpleado?: number, keyword?: string, idTipoEmpleado?: number, idTipoEmpleadoPlanta?: number, idClasificacionEmpleadoPlanta?: number, idSubclasificacionEmpleadoPlanta?: number, idTipoTarifaEmpleado?: number, anioTarifaEmpleado?: number, estadoTarifaEmpleado?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<TarifasEmpleadosI[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('orderMode', orderMode);
    if (idTarifaEmpleado !== undefined) params = params.set('idTarifaEmpleado', idTarifaEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (idTipoEmpleado !== undefined) params = params.set('idTipoEmpleado', idTipoEmpleado.toString());
    if (idTipoEmpleadoPlanta !== undefined) params = params.set('idTipoEmpleadoPlanta', idTipoEmpleadoPlanta.toString());
    if (idClasificacionEmpleadoPlanta !== undefined) params = params.set('idClasificacionEmpleadoPlanta', idClasificacionEmpleadoPlanta.toString());
    if (idSubclasificacionEmpleadoPlanta !== undefined) params = params.set('idSubclasificacionEmpleadoPlanta', idSubclasificacionEmpleadoPlanta.toString());
    if (idTipoTarifaEmpleado !== undefined) params = params.set('idTipoTarifaEmpleado', idTipoTarifaEmpleado.toString());
    if (anioTarifaEmpleado !== undefined) params = params.set('anioTarifaEmpleado', anioTarifaEmpleado.toString());
    if (estadoTarifaEmpleado) params = params.set('estadoTarifaEmpleado', estadoTarifaEmpleado);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<any>(`${this.baseUrl}/tarifasEmpleados/listaPag`, { params }).pipe(
      map((slice: any) => slice.content as TarifasEmpleadosI[])
    );
  }

  //CREAR REGISTRO.
  addEmployeeRate(tarifaEmpleado: TarifasEmpleadosI): Observable<TarifasEmpleadosMsj> {
    return this.http.post<TarifasEmpleadosMsj>(`${this.baseUrl}/tarifasEmpleados`, tarifaEmpleado);
  }

  //CONSULTAR REGISTRO POR ID.
  getEmployeeRatebyId(idTarifaEmpleado: number): Observable<ResponseTarifaEmpleadoDTO> {
    return this.http.get<ResponseTarifaEmpleadoDTO>(`${this.baseUrl}/tarifasEmpleados/${idTarifaEmpleado}`);
  }

  //CONSULTAR REGISTRO POR ID DE TIPO DE EMPLEADO, TIPO DE EMPLEADO PLANTA, CLASIFICACIÓN, SUBCLASIFICACIÓN, TIPO DE TARIFA Y AÑO.
  getEmployeeRatebyPerfilTipoTarifaAnio(idTipoEmpleado: number, idTipoEmpleadoPlanta: number, idClasificacionEmpleadoPlanta: number, idSubclasificacionEmpleadoPlanta: number, idTipoTarifaEmpleado: number, anioTarifaEmpleado: number): Observable<ResponseTarifaEmpleadoDTO> {
    return this.http.get<ResponseTarifaEmpleadoDTO>(
      `${this.baseUrl}/tarifasEmpleados/idTipoEmpleado/${idTipoEmpleado}/idTipoEmpleadoPlanta/${idTipoEmpleadoPlanta}/idClasificacionEmpleadoPlanta/${idClasificacionEmpleadoPlanta}/idSubclasificacionEmpleadoPlanta/${idSubclasificacionEmpleadoPlanta}/idTipoTarifaEmpleado/${idTipoTarifaEmpleado}/anio/${anioTarifaEmpleado}`
    );
  }

  //MODIFICAR REGISTRO.
  updateEmployeeRate(tarifaEmpleado: TarifasEmpleadosI): Observable<TarifasEmpleadosMsj> {
    return this.http.put<TarifasEmpleadosMsj>(`${this.baseUrl}/tarifasEmpleados`, tarifaEmpleado);
  }

  //ELIMINAR REGISTRO.
  deleteEmployeeRate(idTarifaEmpleado: number): Observable<TarifasEmpleadosMsj> {
    return this.http.delete<TarifasEmpleadosMsj>(`${this.baseUrl}/tarifasEmpleados/${idTarifaEmpleado}`);
  }

}
