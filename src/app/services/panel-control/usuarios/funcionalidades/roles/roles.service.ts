import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseRolDTO } from '../../../../../interfaces/panel-control/usuarios/funcionalidades/roles/responseRolesDTO.interface';
import { RolesI, RolesMsj } from '../../../../../interfaces/panel-control/usuarios/funcionalidades/roles/roles.interface';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idRol?: number, keyword?: string, idFuncionalidad?: number): Observable<number> {
    let params = new HttpParams();
    if (idRol !== undefined) params = params.set('idRol', idRol.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (idFuncionalidad !== undefined) params = params.set('idFuncionalidad', idFuncionalidad.toString());
    return this.http.get<number>(`${this.baseUrl}/roles/count`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllRoles(idRol?: number, keyword?: string, idFuncionalidad?: number, orderBy?: string, orderMode: string = 'ASC'): Observable<RolesI[]> {
    let params = new HttpParams().set('orderMode', orderMode);
    if (idRol !== undefined) params = params.set('idRol', idRol.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (idFuncionalidad !== undefined) params = params.set('idFuncionalidad', idFuncionalidad.toString());
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<RolesI[]>(`${this.baseUrl}/roles/lista`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllRolesPag(page: number = 0, size: number = 10, idRol?: number, keyword?: string, idFuncionalidad?: number, orderBy?: string, orderMode: string = 'ASC'): Observable<RolesI[]> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('orderMode', orderMode);
    if (idRol !== undefined) params = params.set('idRol', idRol.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (idFuncionalidad !== undefined) params = params.set('idFuncionalidad', idFuncionalidad.toString());
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<any>(`${this.baseUrl}/roles/listaPag`, { params }).pipe(
      map((slice: any) => slice.content as RolesI[])
    );
  }

  //CREAR REGISTRO.
  addRole(rol: RolesI): Observable<RolesMsj> {
    return this.http.post<RolesMsj>(`${this.baseUrl}/roles`, rol);
  }

  //CONSULTAR REGISTRO POR ID.
  getRolebyId(idRol: number): Observable<ResponseRolDTO> {
    return this.http.get<ResponseRolDTO>(`${this.baseUrl}/roles/${idRol}`);
  }

  //CONSULTAR REGISTRO POR ID DE FUNCIONALIDAD.
  getRolebyIdFuncionalidad(idRol: number, idFuncionalidad: number): Observable<ResponseRolDTO> {
    return this.http.get<ResponseRolDTO>(`${this.baseUrl}/roles/${idRol}/funcionalidad/${idFuncionalidad}`);
  }

  //CONSULTAR REGISTRO POR NOMBRE DE FUNCIONALIDAD.
  getRolebyNombreFuncionalidad(nombreRol: string, nombreFuncionalidad: string): Observable<ResponseRolDTO> {
    return this.http.get<ResponseRolDTO>(`${this.baseUrl}/roles/nombre/${nombreRol}/funcionalidad/${nombreFuncionalidad}`);
  }

  //MODIFICAR REGISTRO.
  updateRole(rol: RolesI): Observable<RolesMsj> {
    return this.http.put<RolesMsj>(`${this.baseUrl}/roles`, rol);
  }

  //ELIMINAR REGISTRO.
  deleteRole(idRol: number): Observable<RolesMsj> {
    return this.http.delete<RolesMsj>(`${this.baseUrl}/roles/${idRol}`);
  }

}
