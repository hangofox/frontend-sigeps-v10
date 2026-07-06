import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseAltaEmpleadoDTO } from '../../../../interfaces/gestion-personal/empleados/altas-empleados/responseAltaEmpleadoDTO.interface';
import { AltasEmpleadosI, AltasEmpleadosMsj } from '../../../../interfaces/gestion-personal/empleados/altas-empleados/altasEmpleados.interface';

@Injectable({
  providedIn: 'root'
})
export class AltasEmpleadosService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idAltaEmpleado?: number, keyword?: string): Observable<number> {
    let params = new HttpParams();
    if (idAltaEmpleado !== undefined) params = params.set('idAltaEmpleado', idAltaEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    return this.http.get<number>(`${this.baseUrl}/altasEmpleados/count`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllHiringsOfEmployees(idAltaEmpleado?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<AltasEmpleadosI[]> {
    let params = new HttpParams().set('orderMode', orderMode);
    if (idAltaEmpleado !== undefined) params = params.set('idAltaEmpleado', idAltaEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<AltasEmpleadosI[]>(`${this.baseUrl}/altasEmpleados/lista`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllHiringsOfEmployeesPag(page: number = 0, size: number = 10, idAltaEmpleado?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<AltasEmpleadosI[]> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('orderMode', orderMode);
    if (idAltaEmpleado !== undefined) params = params.set('idAltaEmpleado', idAltaEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<any>(`${this.baseUrl}/altasEmpleados/listaPag`, { params }).pipe(
      map((slice: any) => slice.content as AltasEmpleadosI[])
    );
  }

  //CREAR REGISTRO.
  addHiringOfEmployee(alta: AltasEmpleadosI): Observable<AltasEmpleadosMsj> {
    return this.http.post<AltasEmpleadosMsj>(`${this.baseUrl}/altasEmpleados`, alta);
  }

  //CONSULTAR REGISTRO POR ID.
  getHiringOfEmployeebyId(idAltaEmpleado: number): Observable<ResponseAltaEmpleadoDTO> {
    return this.http.get<ResponseAltaEmpleadoDTO>(`${this.baseUrl}/altasEmpleados/${idAltaEmpleado}`);
  }

  //CONSULTAR REGISTRO POR NÚMERO DE CONTRATO.
  getHiringOfEmployeebyNumeroContrato(numeroContratoOActoAdmvoNombEmpleado: string): Observable<ResponseAltaEmpleadoDTO> {
    return this.http.get<ResponseAltaEmpleadoDTO>(`${this.baseUrl}/altasEmpleados/numeroContrato/${numeroContratoOActoAdmvoNombEmpleado}`);
  }

  //MODIFICAR REGISTRO.
  updateHiringOfEmployee(alta: AltasEmpleadosI): Observable<AltasEmpleadosMsj> {
    return this.http.put<AltasEmpleadosMsj>(`${this.baseUrl}/altasEmpleados`, alta);
  }

  //ELIMINAR REGISTRO.
  deleteHiringOfEmployee(idAltaEmpleado: number): Observable<AltasEmpleadosMsj> {
    return this.http.delete<AltasEmpleadosMsj>(`${this.baseUrl}/altasEmpleados/${idAltaEmpleado}`);
  }

}
