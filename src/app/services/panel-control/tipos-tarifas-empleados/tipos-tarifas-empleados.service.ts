import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseTipoTarifaEmpleadoDTO } from '../../../interfaces/panel-control/tipos-tarifas-empleados/responseTipoTarifaEmpleadoDTO.interface';
import { TiposTarifasEmpleadosI, TiposTarifasEmpleadosMsj } from '../../../interfaces/panel-control/tipos-tarifas-empleados/tipos-tarifas-empleados.interface';

@Injectable({
  providedIn: 'root'
})
export class TiposTarifasEmpleadosService {
  
  private baseUrl = environment.baseUrl;
  
  constructor(private http: HttpClient) {}
  
  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idTipoTarifaEmpleado?: number, keyword?: string, estadoTipoTarifaEmpleado?: string): Observable<number> {
    let params = new HttpParams();
    if (idTipoTarifaEmpleado !== undefined) params = params.set('idTipoTarifaEmpleado', idTipoTarifaEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (estadoTipoTarifaEmpleado) params = params.set('estadoTipoTarifaEmpleado', estadoTipoTarifaEmpleado);
    return this.http.get<number>(`${this.baseUrl}/tiposTarifasEmpleados/count`, { params });
  }
  
  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllEmployeeRateTypes(idTipoTarifaEmpleado?: number, keyword?: string, estadoTipoTarifaEmpleado?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<TiposTarifasEmpleadosI[]> {
    let params = new HttpParams().set('orderMode', orderMode);
    if (idTipoTarifaEmpleado !== undefined) params = params.set('idTipoTarifaEmpleado', idTipoTarifaEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (estadoTipoTarifaEmpleado) params = params.set('estadoTipoTarifaEmpleado', estadoTipoTarifaEmpleado);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<TiposTarifasEmpleadosI[]>(`${this.baseUrl}/tiposTarifasEmpleados/lista`, { params });
  }
  
  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllEmployeeRateTypesPag(page: number = 0, size: number = 10, idTipoTarifaEmpleado?: number, keyword?: string, estadoTipoTarifaEmpleado?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<TiposTarifasEmpleadosI[]> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('orderMode', orderMode);
    if (idTipoTarifaEmpleado !== undefined) params = params.set('idTipoTarifaEmpleado', idTipoTarifaEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (estadoTipoTarifaEmpleado) params = params.set('estadoTipoTarifaEmpleado', estadoTipoTarifaEmpleado);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<any>(`${this.baseUrl}/tiposTarifasEmpleados/listaPag`, { params }).pipe(
      map((slice: any) => slice.content as TiposTarifasEmpleadosI[])
    );
  }
  
  //CREAR REGISTRO.
  addEmployeeRateType(tipoTarifaEmpleado: TiposTarifasEmpleadosI): Observable<TiposTarifasEmpleadosMsj> {
    return this.http.post<TiposTarifasEmpleadosMsj>(`${this.baseUrl}/tiposTarifasEmpleados`, tipoTarifaEmpleado);
  }
  
  //CONSULTAR REGISTRO POR ID.
  getEmployeeRateTypebyId(idTipoTarifaEmpleado: number): Observable<ResponseTipoTarifaEmpleadoDTO> {
    return this.http.get<ResponseTipoTarifaEmpleadoDTO>(`${this.baseUrl}/tiposTarifasEmpleados/${idTipoTarifaEmpleado}`);
  }
  
  //CONSULTAR REGISTRO POR NOMBRE.
  getEmployeeRateTypebyNombre(nombreTipoTarifaEmpleado: string): Observable<ResponseTipoTarifaEmpleadoDTO> {
    return this.http.get<ResponseTipoTarifaEmpleadoDTO>(`${this.baseUrl}/tiposTarifasEmpleados/nombre/${nombreTipoTarifaEmpleado}`);
  }
  
  //MODIFICAR REGISTRO.
  updateEmployeeRateType(tipoTarifaEmpleado: TiposTarifasEmpleadosI): Observable<TiposTarifasEmpleadosMsj> {
    return this.http.put<TiposTarifasEmpleadosMsj>(`${this.baseUrl}/tiposTarifasEmpleados`, tipoTarifaEmpleado);
  }
  
  //ELIMINAR REGISTRO.
  deleteEmployeeRateType(idTipoTarifaEmpleado: number): Observable<TiposTarifasEmpleadosMsj> {
    return this.http.delete<TiposTarifasEmpleadosMsj>(`${this.baseUrl}/tiposTarifasEmpleados/${idTipoTarifaEmpleado}`);
  }

}
