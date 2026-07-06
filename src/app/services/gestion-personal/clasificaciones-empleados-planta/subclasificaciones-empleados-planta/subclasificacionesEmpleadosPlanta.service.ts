import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseSubclasificacionEmpleadoPlantaDTO } from '../../../../interfaces/gestion-personal/clasificaciones-empleados-planta/subclasificaciones-empleados-planta/responseSubclasificacionEmpleadoPlantaDTO.interface';
import { SubclasificacionEmpleadoPlantaI, SubclasificacionEmpleadoPlantaMsj } from '../../../../interfaces/gestion-personal/clasificaciones-empleados-planta/subclasificaciones-empleados-planta/subclasificaciones-empleados-planta.interface';

@Injectable({
  providedIn: 'root'
})
export class SubclasificacionesEmpleadosPlantaService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idSubclasificacionEmpleadoPlanta?: number, keyword?: string): Observable<number> {
    let params = new HttpParams();
    if (idSubclasificacionEmpleadoPlanta !== undefined) params = params.set('idSubclasificacionEmpleadoPlanta', idSubclasificacionEmpleadoPlanta.toString());
    if (keyword) params = params.set('keyword', keyword);
    return this.http.get<number>(`${this.baseUrl}/subclasificacionesEmpleadosPlantas/count`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllSubclassificationsOfStaffEmployees(idSubclasificacionEmpleadoPlanta?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<SubclasificacionEmpleadoPlantaI[]> {
    let params = new HttpParams().set('orderMode', orderMode);
    if (idSubclasificacionEmpleadoPlanta !== undefined) params = params.set('idSubclasificacionEmpleadoPlanta', idSubclasificacionEmpleadoPlanta.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<SubclasificacionEmpleadoPlantaI[]>(`${this.baseUrl}/subclasificacionesEmpleadosPlantas/lista`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllSubclassificationsOfStaffEmployeesPag(page: number = 0, size: number = 10, idSubclasificacionEmpleadoPlanta?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<SubclasificacionEmpleadoPlantaI[]> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('orderMode', orderMode);
    if (idSubclasificacionEmpleadoPlanta !== undefined) params = params.set('idSubclasificacionEmpleadoPlanta', idSubclasificacionEmpleadoPlanta.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<any>(`${this.baseUrl}/subclasificacionesEmpleadosPlantas/listaPag`, { params }).pipe(
      map((slice: any) => slice.content as SubclasificacionEmpleadoPlantaI[])
    );
  }

  //CREAR REGISTRO.
  addSubclassificationOfStaffEmployee(subclasificacion: SubclasificacionEmpleadoPlantaI): Observable<SubclasificacionEmpleadoPlantaMsj> {
    return this.http.post<SubclasificacionEmpleadoPlantaMsj>(`${this.baseUrl}/subclasificacionesEmpleadosPlantas`, subclasificacion);
  }

  //CONSULTAR REGISTRO POR ID.
  getSubclassificationOfStaffEmployeebyId(idSubclasificacionEmpleadoPlanta: number): Observable<ResponseSubclasificacionEmpleadoPlantaDTO> {
    return this.http.get<ResponseSubclasificacionEmpleadoPlantaDTO>(`${this.baseUrl}/subclasificacionesEmpleadosPlantas/${idSubclasificacionEmpleadoPlanta}`);
  }

  //CONSULTAR REGISTRO POR NOMBRE.
  getSubclassificationOfStaffEmployeebyNombre(nombreSubclasificacionEmpleadoPlanta: string): Observable<ResponseSubclasificacionEmpleadoPlantaDTO> {
    return this.http.get<ResponseSubclasificacionEmpleadoPlantaDTO>(`${this.baseUrl}/subclasificacionesEmpleadosPlantas/nombre/${nombreSubclasificacionEmpleadoPlanta}`);
  }

  //MODIFICAR REGISTRO.
  updateSubclassificationOfStaffEmployee(subclasificacion: SubclasificacionEmpleadoPlantaI): Observable<SubclasificacionEmpleadoPlantaMsj> {
    return this.http.put<SubclasificacionEmpleadoPlantaMsj>(`${this.baseUrl}/subclasificacionesEmpleadosPlantas`, subclasificacion);
  }

  //ELIMINAR REGISTRO.
  deleteSubclassificationOfStaffEmployee(idSubclasificacionEmpleadoPlanta: number): Observable<SubclasificacionEmpleadoPlantaMsj> {
    return this.http.delete<SubclasificacionEmpleadoPlantaMsj>(`${this.baseUrl}/subclasificacionesEmpleadosPlantas/${idSubclasificacionEmpleadoPlanta}`);
  }

}
