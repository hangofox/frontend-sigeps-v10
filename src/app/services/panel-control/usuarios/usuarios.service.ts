import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseUsuarioDTO } from '../../../interfaces/panel-control/usuarios/responseUsuarioDTO.interface';
import { UsuariosI, UsuariosMsj } from '../../../interfaces/panel-control/usuarios/usuarios.interface';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  
  //SI EL PROYECTO SE DESPLIEGA EN DESAROLLO ASIGNA LA IP DEL SERVIDOR DE DESARROLLO, SI EL PROYECTO SE DESPLIEGA EN PRUEBAS O PRODUCCIÓN TRAE LA IP DEL SERVIDOR DE PRUEBAS O PRODUCCIÓN:
  private baseUrl = environment.baseUrl;
  
  constructor(private http: HttpClient) {}
  
  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idUsuario?: number, keyword?: String, nombreTipoUsuario?: String): Observable<number> {
     let params = new HttpParams();
     if (idUsuario !== undefined) params = params.set('idUsuario', idUsuario.toString());
     if (keyword) params = params.set('keyword', keyword.toString());
     if (nombreTipoUsuario) params = params.set('nombreTipoUsuario', nombreTipoUsuario.toString());
     return this.http.get<number>(`${this.baseUrl}/usuarios/count`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllUsers(idUsuario?: number, keyword?: String, orderBy?: String, orderMode: String = 'ASC', nombreTipoUsuario?: String): Observable<UsuariosI[]> {
     let params = new HttpParams().set('orderMode', orderMode.toString());
     if (idUsuario !== undefined) params = params.set('idUsuario', idUsuario.toString());
     if (keyword) params = params.set('keyword', keyword.toString());
     if (orderBy) params = params.set('orderBy', orderBy.toString());
     if (nombreTipoUsuario) params = params.set('nombreTipoUsuario', nombreTipoUsuario.toString());
     return this.http.get<UsuariosI[]>(`${this.baseUrl}/usuarios/lista`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllUsersPag(page: number = 0, size: number = 10, idUsuario?: number, keyword?: String, orderBy?: String, orderMode: String = 'ASC', nombreTipoUsuario?: String): Observable<UsuariosI[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('orderMode', orderMode.toString());
    if (idUsuario !== undefined) params = params.set('idUsuario', idUsuario.toString());
    if (keyword) params = params.set('keyword', keyword.toString());
    if (orderBy) params = params.set('orderBy', orderBy.toString());
    if (nombreTipoUsuario) params = params.set('nombreTipoUsuario', nombreTipoUsuario.toString());
    return this.http.get<any>(`${this.baseUrl}/usuarios/listaPag`, { params }).pipe(
      map((slice: any) => slice.content as UsuariosI[])
    );
  }
  
  //CREAR REGISTRO.
  addUser(usuarios: UsuariosI) {
     return this.http.post<UsuariosMsj>(`${this.baseUrl}/usuarios`, usuarios);
  }
  
  //CONSULTAR REGISTRO POR ID.
  getUserbyId(idUsuario: number): Observable<ResponseUsuarioDTO> {
     return this.http.get<ResponseUsuarioDTO>(`${this.baseUrl}/usuarios/${idUsuario}`);
  }
  
  //CONSULTAR REGISTRO POR NÚMERO DE DOCUMENTO DE IDENTIFICACIÓN.
  getUserbyNumeroDocumentoIdentificacion(numeroDocumentoIdentificacionUsuario: String): Observable<ResponseUsuarioDTO> {
     return this.http.get<ResponseUsuarioDTO>(`${this.baseUrl}/usuarios/numeroDocumentoIdentificacion/${numeroDocumentoIdentificacionUsuario}`);
  }
  
  //RECUPERAR ACCESO DE CONTRASEÑA DE USUARIO POR NÚMERO DE DOCUMENTO DE IDENTIFICACIÓN.
  getRecoveryPasswordAccessUserbyNumeroDocumentoIdentificacion(numeroDocumentoIdentificacionUsuario: String): Observable<ResponseUsuarioDTO> {
     return this.http.get<ResponseUsuarioDTO>(`${this.baseUrl}/usuarios/recuperacionContrasena/${numeroDocumentoIdentificacionUsuario}`);
  }
  
  //CONSULTAR REGISTRO DE USUARIO POR NICKNAME Y CONTRASEÑA.
  getUserbyNicknameAndPassword(nicknameUsuario: String, passwordUsuario: String): Observable<ResponseUsuarioDTO> {
     return this.http.get<ResponseUsuarioDTO>(`${this.baseUrl}/usuarios/nicknameYPassword/${nicknameUsuario}/${passwordUsuario}`);
  }
  
  //MODIFICAR REGISTRO.
  updateUser(usuarios: UsuariosI): Observable<UsuariosMsj> {
     return this.http.put<UsuariosMsj>(`${this.baseUrl}/usuarios`, usuarios);
  }
  
  //MODIFICAR CONTRASEÑA.
  updatePassword(idUsuario: number, passwordUsuario: String): Observable<UsuariosMsj> {
     return this.http.put<UsuariosMsj>(`${this.baseUrl}/usuarios/actualizarPassword/${idUsuario}/${passwordUsuario}`, null);
  }
  
  //ELIMINAR REGISTRO.
  deleteUser(idUsuario: number): Observable<UsuariosMsj> {
     return this.http.delete<UsuariosMsj>(`${this.baseUrl}/usuarios/${idUsuario}`);
  }
  
}
