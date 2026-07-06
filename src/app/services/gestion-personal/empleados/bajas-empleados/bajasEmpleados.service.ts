import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseBajaEmpleadoDTO } from '../../../../interfaces/gestion-personal/empleados/bajas-empleados/responseBajaEmpleadoDTO.interface';
import { BajasEmpleadosI, BajasEmpleadosMsj } from '../../../../interfaces/gestion-personal/empleados/bajas-empleados/bajasEmpleados.interface';

@Injectable({
  providedIn: 'root'
})
export class BajasEmpleadosService {

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
  findAllDischargesOfEmployees(idBajaEmpleado?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<BajasEmpleadosI[]> {
    let params = new HttpParams().set('orderMode', orderMode);
    if (idBajaEmpleado !== undefined) params = params.set('idBajaEmpleado', idBajaEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<BajasEmpleadosI[]>(`${this.baseUrl}/bajasEmpleados/lista`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllDischargesOfEmployeesPag(page: number = 0, size: number = 10, idBajaEmpleado?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<BajasEmpleadosI[]> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('orderMode', orderMode);
    if (idBajaEmpleado !== undefined) params = params.set('idBajaEmpleado', idBajaEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<any>(`${this.baseUrl}/bajasEmpleados/listaPag`, { params }).pipe(
      map((slice: any) => slice.content as BajasEmpleadosI[])
    );
  }

  //CREAR REGISTRO.
  addDischargeOfEmployee(baja: BajasEmpleadosI): Observable<BajasEmpleadosMsj> {
    return this.http.post<BajasEmpleadosMsj>(`${this.baseUrl}/bajasEmpleados`, baja);
  }

  //CONSULTAR REGISTRO POR ID.
  getDischargeOfEmployeebyId(idBajaEmpleado: number): Observable<ResponseBajaEmpleadoDTO> {
    return this.http.get<ResponseBajaEmpleadoDTO>(`${this.baseUrl}/bajasEmpleados/${idBajaEmpleado}`);
  }

  //CONSULTAR REGISTRO POR NÚMERO DE CONTRATO.
  getDischargeOfEmployeebyNumeroContrato(numeroContratoOActoAdmvoNombEmpleado: string): Observable<ResponseBajaEmpleadoDTO> {
    return this.http.get<ResponseBajaEmpleadoDTO>(
      `${this.baseUrl}/bajasEmpleados/numeroContrato/${numeroContratoOActoAdmvoNombEmpleado}`
    );
  }

  //MODIFICAR REGISTRO.
  updateDischargeOfEmployee(baja: BajasEmpleadosI): Observable<BajasEmpleadosMsj> {
    return this.http.put<BajasEmpleadosMsj>(`${this.baseUrl}/bajasEmpleados`, baja);
  }

  //ELIMINAR REGISTRO.
  deleteDischargeOfEmployee(idBajaEmpleado: number): Observable<BajasEmpleadosMsj> {
    return this.http.delete<BajasEmpleadosMsj>(`${this.baseUrl}/bajasEmpleados/${idBajaEmpleado}`);
  }

}
