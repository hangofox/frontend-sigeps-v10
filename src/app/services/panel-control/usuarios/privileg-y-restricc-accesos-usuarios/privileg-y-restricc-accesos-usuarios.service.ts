import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponsePrivilegyRestriccAccesoUsuarioDTO } from '../../../../interfaces/panel-control/usuarios/privileg-y-restricc-accesos-usuarios/responsePrivilegyRestriccAccesoUsuarioDTO.interface';
import { PrivilegyRestriccAccesosUsuariosI, PrivilegyRestriccAccesosUsuariosMsj } from '../../../../interfaces/panel-control/usuarios/privileg-y-restricc-accesos-usuarios/privileg-y-restricc-accesos-usuarios.interface';

@Injectable({
  providedIn: 'root'
})
export class PrivilegyRestriccAccesosUsuariosService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idPrivilegyRestriccAccesoUsuario?: number, keyword?: string, idFuncionalidad?: number, nombreFuncionalidad?: string, idRol?: number, nombreRol?: string, idUsuario?: number): Observable<number> {
    let params = new HttpParams();
    if (idPrivilegyRestriccAccesoUsuario !== undefined) params = params.set('idPrivilegyRestriccAccesoUsuario', idPrivilegyRestriccAccesoUsuario.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (idFuncionalidad !== undefined) params = params.set('idFuncionalidad', idFuncionalidad.toString());
    if (nombreFuncionalidad) params = params.set('nombreFuncionalidad', nombreFuncionalidad);
    if (idRol !== undefined) params = params.set('idRol', idRol.toString());
    if (nombreRol) params = params.set('nombreRol', nombreRol);
    if (idUsuario !== undefined) params = params.set('idUsuario', idUsuario.toString());
    return this.http.get<number>(`${this.baseUrl}/privilegyRestriccAccesoUsuario/count`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllPrivilegesAndRestrictionsAccessUsers(idPrivilegyRestriccAccesoUsuario?: number, keyword?: string, idFuncionalidad?: number, nombreFuncionalidad?: string, idRol?: number, nombreRol?: string, idUsuario?: number, orderBy?: string, orderMode: string = 'ASC'): Observable<PrivilegyRestriccAccesosUsuariosI[]> {
    let params = new HttpParams().set('orderMode', orderMode);
    if (idPrivilegyRestriccAccesoUsuario !== undefined) params = params.set('idPrivilegyRestriccAccesoUsuario', idPrivilegyRestriccAccesoUsuario.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (idFuncionalidad !== undefined) params = params.set('idFuncionalidad', idFuncionalidad.toString());
    if (nombreFuncionalidad) params = params.set('nombreFuncionalidad', nombreFuncionalidad);
    if (idRol !== undefined) params = params.set('idRol', idRol.toString());
    if (nombreRol) params = params.set('nombreRol', nombreRol);
    if (idUsuario !== undefined) params = params.set('idUsuario', idUsuario.toString());
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<PrivilegyRestriccAccesosUsuariosI[]>(`${this.baseUrl}/privilegyRestriccAccesoUsuario/lista`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllPrivilegesAndRestrictionsAccessUsersPag(page: number = 0, size: number = 10, idPrivilegyRestriccAccesoUsuario?: number, keyword?: string, idFuncionalidad?: number, nombreFuncionalidad?: string, idRol?: number, nombreRol?: string, idUsuario?: number, orderBy?: string, orderMode: string = 'ASC'): Observable<PrivilegyRestriccAccesosUsuariosI[]> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('orderMode', orderMode);
    if (idPrivilegyRestriccAccesoUsuario !== undefined) params = params.set('idPrivilegyRestriccAccesoUsuario', idPrivilegyRestriccAccesoUsuario.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (idFuncionalidad !== undefined) params = params.set('idFuncionalidad', idFuncionalidad.toString());
    if (nombreFuncionalidad) params = params.set('nombreFuncionalidad', nombreFuncionalidad);
    if (idRol !== undefined) params = params.set('idRol', idRol.toString());
    if (nombreRol) params = params.set('nombreRol', nombreRol);
    if (idUsuario !== undefined) params = params.set('idUsuario', idUsuario.toString());
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<any>(`${this.baseUrl}/privilegyRestriccAccesoUsuario/listaPag`, { params }).pipe(
      map((slice: any) => slice.content as PrivilegyRestriccAccesosUsuariosI[])
    );
  }

  //CREAR REGISTRO.
  addPrivilegeAndRestrictionAccessUser(privilegio: PrivilegyRestriccAccesosUsuariosI): Observable<PrivilegyRestriccAccesosUsuariosMsj> {
    return this.http.post<PrivilegyRestriccAccesosUsuariosMsj>(`${this.baseUrl}/privilegyRestriccAccesoUsuario`, privilegio);
  }

  //CREAR VARIOS REGISTROS.
  addPrivilegesAndRestrictionsAccessUsers(privilegios: PrivilegyRestriccAccesosUsuariosI[]): Observable<PrivilegyRestriccAccesosUsuariosMsj> {
    return this.http.post<PrivilegyRestriccAccesosUsuariosMsj>(`${this.baseUrl}/privilegyRestriccAccesosUsuarios`, privilegios);
  }

  //CONSULTAR REGISTRO POR ID.
  getPrivilegeAndRestrictionAccessUserbyId(idPrivilegyRestriccAccesoUsuario: number): Observable<ResponsePrivilegyRestriccAccesoUsuarioDTO> {
    return this.http.get<ResponsePrivilegyRestriccAccesoUsuarioDTO>(`${this.baseUrl}/privilegyRestriccAccesoUsuario/${idPrivilegyRestriccAccesoUsuario}`);
  }

  //CONSULTAR REGISTRO POR ID DE USUARIO, FUNCIONALIDAD Y ROL.
  getPrivilegeAndRestrictionAccessUserbyIdsUsuarioFuncionalidadRol(idUsuario: number, idFuncionalidad: number, idRol: number): Observable<ResponsePrivilegyRestriccAccesoUsuarioDTO> {
    return this.http.get<ResponsePrivilegyRestriccAccesoUsuarioDTO>(`${this.baseUrl}/privilegyRestriccAccesoUsuario/idUsuario/${idUsuario}/idFuncionalidad/${idFuncionalidad}/idRol/${idRol}`);
  }

  //CONSULTAR REGISTRO POR NOMBRES DE FUNCIONALIDAD Y ROL.
  getPrivilegeAndRestrictionAccessUserbyNombresUsuarioFuncionalidadRol(idUsuario: number, nombreFuncionalidad: string, nombreRol: string): Observable<ResponsePrivilegyRestriccAccesoUsuarioDTO> {
    return this.http.get<ResponsePrivilegyRestriccAccesoUsuarioDTO>(`${this.baseUrl}/privilegyRestriccAccesoUsuario/idUsuario/${idUsuario}/nombreFuncionalidad/${nombreFuncionalidad}/nombreRol/${nombreRol}`);
  }

  //MODIFICAR REGISTRO.
  updatePrivilegeAndRestrictionAccessUser(privilegio: PrivilegyRestriccAccesosUsuariosI): Observable<PrivilegyRestriccAccesosUsuariosMsj> {
    return this.http.put<PrivilegyRestriccAccesosUsuariosMsj>(`${this.baseUrl}/privilegyRestriccAccesoUsuario`, privilegio);
  }

  //ELIMINAR REGISTRO.
  deletePrivilegeAndRestrictionAccessUser(idPrivilegyRestriccAccesoUsuario: number): Observable<PrivilegyRestriccAccesosUsuariosMsj> {
    return this.http.delete<PrivilegyRestriccAccesosUsuariosMsj>(`${this.baseUrl}/privilegyRestriccAccesoUsuario/${idPrivilegyRestriccAccesoUsuario}`);
  }

  //ELIMINAR REGISTROS POR ID DE USUARIO.
  deletePrivilegesAndRestrictionsAccessUsersbyIdUsuario(idUsuario: number): Observable<PrivilegyRestriccAccesosUsuariosMsj> {
    return this.http.delete<PrivilegyRestriccAccesosUsuariosMsj>(`${this.baseUrl}/privilegyRestriccAccesoUsuario/idUsuario/${idUsuario}`);
  }

}
