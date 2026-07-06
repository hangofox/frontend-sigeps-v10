import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseClasificacionEmpleadoPlantaDTO } from '../../../interfaces/gestion-personal/clasificaciones-empleados-planta/responseClasificacionEmpleadoPlantaDTO.interface';
import { ClasificacionEmpleadoPlantaI, ClasificacionEmpleadoPlantaMsj } from '../../../interfaces/gestion-personal/clasificaciones-empleados-planta/clasificaciones-empleados-planta.interface';

@Injectable({
  providedIn: 'root'
})
export class ClasificacionesEmpleadosPlantaService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idClasificacionEmpleadoPlanta?: number, keyword?: string): Observable<number> {
    let params = new HttpParams();
    if (idClasificacionEmpleadoPlanta !== undefined) params = params.set('idClasificacionEmpleadoPlanta', idClasificacionEmpleadoPlanta.toString());
    if (keyword) params = params.set('keyword', keyword);
    return this.http.get<number>(`${this.baseUrl}/clasificacionesEmpleadosPlantas/count`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllClassificationsOfStaffEmployees(idClasificacionEmpleadoPlanta?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<ClasificacionEmpleadoPlantaI[]> {
    let params = new HttpParams().set('orderMode', orderMode);
    if (idClasificacionEmpleadoPlanta !== undefined) params = params.set('idClasificacionEmpleadoPlanta', idClasificacionEmpleadoPlanta.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<ClasificacionEmpleadoPlantaI[]>(`${this.baseUrl}/clasificacionesEmpleadosPlantas/lista`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllClassificationsOfStaffEmployeesPag(page: number = 0, size: number = 10, idClasificacionEmpleadoPlanta?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<ClasificacionEmpleadoPlantaI[]> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('orderMode', orderMode);
    if (idClasificacionEmpleadoPlanta !== undefined) params = params.set('idClasificacionEmpleadoPlanta', idClasificacionEmpleadoPlanta.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<any>(`${this.baseUrl}/clasificacionesEmpleadosPlantas/listaPag`, { params }).pipe(
      map((slice: any) => slice.content as ClasificacionEmpleadoPlantaI[])
    );
  }

  //CREAR REGISTRO.
  addClassificationOfStaffEmployee(clasificacion: ClasificacionEmpleadoPlantaI): Observable<ClasificacionEmpleadoPlantaMsj> {
    return this.http.post<ClasificacionEmpleadoPlantaMsj>(`${this.baseUrl}/clasificacionesEmpleadosPlantas`, clasificacion);
  }

  //CONSULTAR REGISTRO POR ID.
  getClassificationOfStaffEmployeebyId(idClasificacionEmpleadoPlanta: number): Observable<ResponseClasificacionEmpleadoPlantaDTO> {
    return this.http.get<ResponseClasificacionEmpleadoPlantaDTO>(`${this.baseUrl}/clasificacionesEmpleadosPlantas/${idClasificacionEmpleadoPlanta}`);
  }

  //CONSULTAR REGISTRO POR NOMBRE.
  getClassificationOfStaffEmployeebyNombre(nombreClasificacionEmpleadoPlanta: string): Observable<ResponseClasificacionEmpleadoPlantaDTO> {
    return this.http.get<ResponseClasificacionEmpleadoPlantaDTO>(`${this.baseUrl}/clasificacionesEmpleadosPlantas/nombre/${nombreClasificacionEmpleadoPlanta}`);
  }

  //MODIFICAR REGISTRO.
  updateClassificationOfStaffEmployee(clasificacion: ClasificacionEmpleadoPlantaI): Observable<ClasificacionEmpleadoPlantaMsj> {
    return this.http.put<ClasificacionEmpleadoPlantaMsj>(`${this.baseUrl}/clasificacionesEmpleadosPlantas`, clasificacion);
  }

  //ELIMINAR REGISTRO.
  deleteClassificationOfStaffEmployee(idClasificacionEmpleadoPlanta: number): Observable<ClasificacionEmpleadoPlantaMsj> {
    return this.http.delete<ClasificacionEmpleadoPlantaMsj>(`${this.baseUrl}/clasificacionesEmpleadosPlantas/${idClasificacionEmpleadoPlanta}`);
  }

}
