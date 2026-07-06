import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseRecuperacionContrasenaAccesoUsuarioDTO } from '../../../../interfaces/panel-control/parametros-sistema/recuperaciones-contrasenas-accesos-usuarios/responseRecuperacionContrasenaAccesoUsuarioDTO.interface';
import { RecuperacionesContrasenasAccesosUsuariosI, RecuperacionesContrasenasAccesosUsuariosMsj } from '../../../../interfaces/panel-control/parametros-sistema/recuperaciones-contrasenas-accesos-usuarios/recuperacionesContrasenasAccesosUsuarios.interface';

@Injectable({
  providedIn: 'root'
})
export class RecuperacionesContrasenasAccesosUsuariosService {
  
  private baseUrl = environment.baseUrl;
  
  constructor(private http: HttpClient) {}
  
  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idRecuperacionContrasenaAccesoUsuario?: number, keyword?: string, idUsuario?: number, estadoUsoCodigoActivacionContrasenaAccesoUsuario?: string): Observable<number> {
    let params = new HttpParams();
    if (idRecuperacionContrasenaAccesoUsuario !== undefined) params = params.set('idRecuperacionContrasenaAccesoUsuario', idRecuperacionContrasenaAccesoUsuario.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (idUsuario !== undefined) params = params.set('idUsuario', idUsuario.toString());
    if (estadoUsoCodigoActivacionContrasenaAccesoUsuario) params = params.set('estadoUsoCodigoActivacionContrasenaAccesoUsuario', estadoUsoCodigoActivacionContrasenaAccesoUsuario);
    return this.http.get<number>(`${this.baseUrl}/recuperacionesContrasenasAccesosUsuarios/count`, { params });
  }
  
  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllRecoveriesPasswordsAccessUsers(idRecuperacionContrasenaAccesoUsuario?: number, keyword?: string, idUsuario?: number, estadoUsoCodigoActivacionContrasenaAccesoUsuario?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<RecuperacionesContrasenasAccesosUsuariosI[]> {
    let params = new HttpParams().set('orderMode', orderMode);
    if (idRecuperacionContrasenaAccesoUsuario !== undefined) params = params.set('idRecuperacionContrasenaAccesoUsuario', idRecuperacionContrasenaAccesoUsuario.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (idUsuario !== undefined) params = params.set('idUsuario', idUsuario.toString());
    if (estadoUsoCodigoActivacionContrasenaAccesoUsuario) params = params.set('estadoUsoCodigoActivacionContrasenaAccesoUsuario', estadoUsoCodigoActivacionContrasenaAccesoUsuario);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<RecuperacionesContrasenasAccesosUsuariosI[]>(`${this.baseUrl}/recuperacionesContrasenasAccesosUsuarios/lista`, { params });
  }
  
  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllRecoveriesPasswordsAccessUsersPag(page: number = 0, size: number = 10, idRecuperacionContrasenaAccesoUsuario?: number, keyword?: string, idUsuario?: number, estadoUsoCodigoActivacionContrasenaAccesoUsuario?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<RecuperacionesContrasenasAccesosUsuariosI[]> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('orderMode', orderMode);
    if (idRecuperacionContrasenaAccesoUsuario !== undefined) params = params.set('idRecuperacionContrasenaAccesoUsuario', idRecuperacionContrasenaAccesoUsuario.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (idUsuario !== undefined) params = params.set('idUsuario', idUsuario.toString());
    if (estadoUsoCodigoActivacionContrasenaAccesoUsuario) params = params.set('estadoUsoCodigoActivacionContrasenaAccesoUsuario', estadoUsoCodigoActivacionContrasenaAccesoUsuario);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<any>(`${this.baseUrl}/recuperacionesContrasenasAccesosUsuarios/listaPag`, { params }).pipe(
      map((slice: any) => slice.content as RecuperacionesContrasenasAccesosUsuariosI[])
    );
  }
  
  //CREAR REGISTRO.
  addRecoveryPasswordAccessUser(recuperacion: RecuperacionesContrasenasAccesosUsuariosI): Observable<RecuperacionesContrasenasAccesosUsuariosMsj> {
    return this.http.post<RecuperacionesContrasenasAccesosUsuariosMsj>(`${this.baseUrl}/recuperacionesContrasenasAccesosUsuarios`, recuperacion);
  }
  
  //CONSULTAR REGISTRO POR ID.
  getRecoveryPasswordAccessUserbyId(idRecuperacionContrasenaAccesoUsuario: number): Observable<ResponseRecuperacionContrasenaAccesoUsuarioDTO> {
    return this.http.get<ResponseRecuperacionContrasenaAccesoUsuarioDTO>(`${this.baseUrl}/recuperacionesContrasenasAccesosUsuarios/${idRecuperacionContrasenaAccesoUsuario}`);
  }
  
  //CONSULTAR REGISTRO POR CÓDIGO DE ACTIVACIÓN.
  getRecoveryPasswordAccessUserbyCodigoActivacion(codigoActivacionContrasenaAccesoUsuario: string): Observable<ResponseRecuperacionContrasenaAccesoUsuarioDTO> {
    return this.http.get<ResponseRecuperacionContrasenaAccesoUsuarioDTO>(`${this.baseUrl}/recuperacionesContrasenasAccesosUsuarios/codigoActivacion/${codigoActivacionContrasenaAccesoUsuario}`);
  }
  
  //MODIFICAR REGISTRO.
  updateRecoveryPasswordAccessUser(recuperacion: RecuperacionesContrasenasAccesosUsuariosI): Observable<RecuperacionesContrasenasAccesosUsuariosMsj> {
    return this.http.put<RecuperacionesContrasenasAccesosUsuariosMsj>(`${this.baseUrl}/recuperacionesContrasenasAccesosUsuarios`, recuperacion);
  }
  
  //ACTUALIZA MASIVAMENTE A "EXPIRADO" LOS CÓDIGOS DE ACTIVACIÓN "PENDIENTE DE USO" CUYA FECHA DE EXPIRACIÓN YA PASÓ
  //RESPECTO A LA fechaHMSExpCodActivContrasenaAccesoUsuario ENVIADA (FORMATO ISO "yyyy-MM-ddTHH:mm:ss.SSS±HH:mm"):
  updateStatesUsesCodesActivationsPasswordsAccessUsersRecoveriesPasswordsAccessUsers(fechaHMSActualIso: string): Observable<RecuperacionesContrasenasAccesosUsuariosMsj> {
    return this.http.put<RecuperacionesContrasenasAccesosUsuariosMsj>(`${this.baseUrl}/recuperacionesContrasenasAccesosUsuarios/actualizarEstados/${fechaHMSActualIso}`, null);
  }
  
  //ELIMINAR REGISTRO.
  deleteRecoveryPasswordAccessUser(idRecuperacionContrasenaAccesoUsuario: number): Observable<RecuperacionesContrasenasAccesosUsuariosMsj> {
    return this.http.delete<RecuperacionesContrasenasAccesosUsuariosMsj>(`${this.baseUrl}/recuperacionesContrasenasAccesosUsuarios/${idRecuperacionContrasenaAccesoUsuario}`);
  }
  
  //VACÍA (ELIMINA) TODOS LOS CÓDIGOS DE RECUPERACIÓN PREVIOS DE UN USUARIO ANTES DE GENERARLE UNO NUEVO:
  toEmptyRecoveriesPasswordsAccessUsersbyIdUsuario(idUsuario: number): Observable<RecuperacionesContrasenasAccesosUsuariosMsj> {
    return this.http.delete<RecuperacionesContrasenasAccesosUsuariosMsj>(`${this.baseUrl}/recuperacionesContrasenasAccesosUsuarios/vaciar/${idUsuario}`);
  }

}
