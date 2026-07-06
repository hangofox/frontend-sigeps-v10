import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseLiquidacionEmpleadoDTO } from '../../../interfaces/gestion-personal/liquidaciones-empleados/responseLiquidacionEmpleadoDTO.interface';
import { LiquidacionesEmpleadosI, LiquidacionesEmpleadosMsj } from '../../../interfaces/gestion-personal/liquidaciones-empleados/liquidacionesEmpleados.interface';

@Injectable({
  providedIn: 'root'
})
export class LiquidacionesEmpleadosService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idBajaEmpleado?: number, keyword?: string): Observable<number> {
    let params = new HttpParams();
    if (idBajaEmpleado !== undefined) params = params.set('idBajaEmpleado', idBajaEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    return this.http.get<number>(`${this.baseUrl}/bajasEmpleados/count`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllEmployeeSettlements(idBajaEmpleado?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<LiquidacionesEmpleadosI[]> {
    let params = new HttpParams().set('orderMode', orderMode);
    if (idBajaEmpleado !== undefined) params = params.set('idBajaEmpleado', idBajaEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<LiquidacionesEmpleadosI[]>(`${this.baseUrl}/bajasEmpleados/lista`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllEmployeeSettlementsPag(page: number = 0, size: number = 10, idBajaEmpleado?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<LiquidacionesEmpleadosI[]> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('orderMode', orderMode);
    if (idBajaEmpleado !== undefined) params = params.set('idBajaEmpleado', idBajaEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<any>(`${this.baseUrl}/bajasEmpleados/listaPag`, { params }).pipe(
      map((slice: any) => slice.content as LiquidacionesEmpleadosI[])
    );
  }

  //CREAR REGISTRO.
  addEmployeeSettlement(baja: LiquidacionesEmpleadosI): Observable<LiquidacionesEmpleadosMsj> {
    return this.http.post<LiquidacionesEmpleadosMsj>(`${this.baseUrl}/bajasEmpleados`, baja);
  }

  //CONSULTAR REGISTRO POR ID.
  getEmployeeSettlementbyId(idBajaEmpleado: number): Observable<ResponseLiquidacionEmpleadoDTO> {
    return this.http.get<ResponseLiquidacionEmpleadoDTO>(`${this.baseUrl}/bajasEmpleados/${idBajaEmpleado}`);
  }

  //CONSULTAR REGISTRO POR NÚMERO DE CONTRATO.
  getEmployeeSettlementbyNumeroContrato(numeroContratoOActoAdmvoNombEmpleado: string): Observable<ResponseLiquidacionEmpleadoDTO> {
    return this.http.get<ResponseLiquidacionEmpleadoDTO>(`${this.baseUrl}/bajasEmpleados/numeroContrato/${numeroContratoOActoAdmvoNombEmpleado}`);
  }

  //MODIFICAR REGISTRO.
  updateEmployeeSettlement(baja: LiquidacionesEmpleadosI): Observable<LiquidacionesEmpleadosMsj> {
    return this.http.put<LiquidacionesEmpleadosMsj>(`${this.baseUrl}/bajasEmpleados`, baja);
  }

  //ELIMINAR REGISTRO.
  deleteEmployeeSettlement(idBajaEmpleado: number): Observable<LiquidacionesEmpleadosMsj> {
    return this.http.delete<LiquidacionesEmpleadosMsj>(`${this.baseUrl}/bajasEmpleados/${idBajaEmpleado}`);
  }

}
