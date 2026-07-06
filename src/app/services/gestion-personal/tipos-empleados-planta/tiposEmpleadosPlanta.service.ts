import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseTipoEmpleadoPlantaDTO } from '../../../interfaces/gestion-personal/tipos-empleados-planta/responseTipoEmpleadoPlantaDTO.interface';
import { TipoEmpleadoPlantaI, TipoEmpleadoPlantaMsj } from '../../../interfaces/gestion-personal/tipos-empleados-planta/tipos-empleados-planta.interface';

@Injectable({
  providedIn: 'root'
})
export class TiposEmpleadosPlantaService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idTipoEmpleadoPlanta?: number, keyword?: string): Observable<number> {
    let params = new HttpParams();
    if (idTipoEmpleadoPlanta !== undefined) params = params.set('idTipoEmpleadoPlanta', idTipoEmpleadoPlanta.toString());
    if (keyword) params = params.set('keyword', keyword);
    return this.http.get<number>(`${this.baseUrl}/tiposEmpleadosPlanta/count`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllTypesOfStaffEmployees(idTipoEmpleadoPlanta?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<TipoEmpleadoPlantaI[]> {
    let params = new HttpParams().set('orderMode', orderMode);
    if (idTipoEmpleadoPlanta !== undefined) params = params.set('idTipoEmpleadoPlanta', idTipoEmpleadoPlanta.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<TipoEmpleadoPlantaI[]>(`${this.baseUrl}/tiposEmpleadosPlanta/lista`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllTypesOfStaffEmployeesPag(page: number = 0, size: number = 10, idTipoEmpleadoPlanta?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<TipoEmpleadoPlantaI[]> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('orderMode', orderMode);
    if (idTipoEmpleadoPlanta !== undefined) params = params.set('idTipoEmpleadoPlanta', idTipoEmpleadoPlanta.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<any>(`${this.baseUrl}/tiposEmpleadosPlanta/listaPag`, { params }).pipe(
      map((slice: any) => slice.content as TipoEmpleadoPlantaI[])
    );
  }

  //CREAR REGISTRO.
  addTypeOfStaffEmployee(tipoEmpleadoPlanta: TipoEmpleadoPlantaI): Observable<TipoEmpleadoPlantaMsj> {
    return this.http.post<TipoEmpleadoPlantaMsj>(`${this.baseUrl}/tiposEmpleadosPlanta`, tipoEmpleadoPlanta);
  }

  //CONSULTAR REGISTRO POR ID.
  getTypeOfStaffEmployeebyId(idTipoEmpleadoPlanta: number): Observable<ResponseTipoEmpleadoPlantaDTO> {
    return this.http.get<ResponseTipoEmpleadoPlantaDTO>(`${this.baseUrl}/tiposEmpleadosPlanta/${idTipoEmpleadoPlanta}`);
  }

  //CONSULTAR REGISTRO POR NOMBRE.
  getTypeOfStaffEmployeebyNombre(nombreTipoEmpleadoPlanta: string): Observable<ResponseTipoEmpleadoPlantaDTO> {
    return this.http.get<ResponseTipoEmpleadoPlantaDTO>(`${this.baseUrl}/tiposEmpleadosPlanta/nombre/${nombreTipoEmpleadoPlanta}`);
  }

  //MODIFICAR REGISTRO.
  updateTypeOfStaffEmployee(tipoEmpleadoPlanta: TipoEmpleadoPlantaI): Observable<TipoEmpleadoPlantaMsj> {
    return this.http.put<TipoEmpleadoPlantaMsj>(`${this.baseUrl}/tiposEmpleadosPlanta`, tipoEmpleadoPlanta);
  }

  //ELIMINAR REGISTRO.
  deleteTypeOfStaffEmployee(idTipoEmpleadoPlanta: number): Observable<TipoEmpleadoPlantaMsj> {
    return this.http.delete<TipoEmpleadoPlantaMsj>(`${this.baseUrl}/tiposEmpleadosPlanta/${idTipoEmpleadoPlanta}`);
  }

}
