import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseTipoUsuarioDTO } from '../../../interfaces/panel-control/tipos-usuarios/responseTipoUsuarioDTO.interface';
import { TiposUsuariosI, TiposUsuariosMsj } from '../../../interfaces/panel-control/tipos-usuarios/tipos-usuarios.interface';

@Injectable({
  providedIn: 'root'
})
export class TiposUsuariosService {
  
  //SI EL PROYECTO SE DESPLIEGA EN DESAROLLO ASIGNA LA IP DEL SERVIDOR DE DESARROLLO, SI EL PROYECTO SE DESPLIEGA EN PRUEBAS O PRODUCCIÓN TRAE LA IP DEL SERVIDOR DE PRUEBAS O PRODUCCIÓN:
  private baseUrl = environment.baseUrl;
  
  constructor(private http: HttpClient) {}
  
  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idTipoUsuario?: number, keyword?: String): Observable<number> {
     let params = new HttpParams();
     if (idTipoUsuario !== undefined) params = params.set('idTipoUsuario', idTipoUsuario.toString());
     if (keyword) params = params.set('keyword', keyword.toString());
     return this.http.get<number>(`${this.baseUrl}/tiposUsuarios/count`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllTypesOfUsers(idTipoUsuario?: number, keyword?: String, orderBy?: String, orderMode: String = 'ASC'): Observable<TiposUsuariosI[]> {
     let params = new HttpParams().set('orderMode', orderMode.toString());
     if (idTipoUsuario !== undefined) params = params.set('idTipoUsuario', idTipoUsuario.toString());
     if (keyword) params = params.set('keyword', keyword.toString());
     if (orderBy) params = params.set('orderBy', orderBy.toString());
     return this.http.get<TiposUsuariosI[]>(`${this.baseUrl}/tiposUsuarios/lista`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllTypesOfUsersPag(page: number = 0, size: number = 10, idTipoUsuario?: number, keyword?: String, orderBy?: String, orderMode: String = 'ASC'): Observable<TiposUsuariosI[]> {
     let params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('orderMode', orderMode.toString());
     if (idTipoUsuario !== undefined) params = params.set('idTipoUsuario', idTipoUsuario.toString());
     if (keyword) params = params.set('keyword', keyword.toString());
     if (orderBy) params = params.set('orderBy', orderBy.toString());
     return this.http.get<any>(`${this.baseUrl}/tiposUsuarios/listaPag`, { params }).pipe(
       map((slice: any) => slice.content as TiposUsuariosI[])
     );
  }
  
  //CREAR REGISTRO.
  addTypeOfUser(tipoUsuario: TiposUsuariosI): Observable<TiposUsuariosMsj> {
     return this.http.post<TiposUsuariosMsj>(`${this.baseUrl}/tiposUsuarios`, tipoUsuario);
  }
  
  //CONSULTAR REGISTRO POR ID.
  getTypeOfUserbyId(idTipoUsuario: number): Observable<ResponseTipoUsuarioDTO> {
     return this.http.get<ResponseTipoUsuarioDTO>(`${this.baseUrl}/tiposUsuarios/${idTipoUsuario}`);
  }
  
  //CONSULTAR REGISTRO POR NOMBRE.
  getTypeOfUserbyNombre(nombreTipoUsuario: String): Observable<ResponseTipoUsuarioDTO> {
     return this.http.get<ResponseTipoUsuarioDTO>(`${this.baseUrl}/tiposUsuarios/nombre/${nombreTipoUsuario}`);
  }
  
  //MODIFICAR REGISTRO.
  updateTypeOfUser(tipoUsuario: TiposUsuariosI): Observable<TiposUsuariosMsj> {
     return this.http.put<TiposUsuariosMsj>(`${this.baseUrl}/tiposUsuarios`, tipoUsuario);
  }
  
  //ELIMINAR REGISTRO.
  deleteTypeOfUser(idTipoUsuario: number): Observable<TiposUsuariosMsj> {
     return this.http.delete<TiposUsuariosMsj>(`${this.baseUrl}/tiposUsuarios/${idTipoUsuario}`);
  }
  
}
