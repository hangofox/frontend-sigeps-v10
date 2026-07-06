import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseParametrosSistemaDTO } from '../../../interfaces/panel-control/parametros-sistema/responseParametrosSistemaDTO.interface';
import { ParametrosSistemaI, ParametrosSistemaMsj } from '../../../interfaces/panel-control/parametros-sistema/parametros-sistema.interface';
import { ResponseParametrosSistemaRecuperacionContrasenaDTO } from '../../../interfaces/panel-control/parametros-sistema/parametrosSistemaRecuperacionContrasena.interface';

@Injectable({
  providedIn: 'root'
})
export class ParametrosSistemaService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idParametrosSistema?: number, keyword?: string): Observable<number> {
    let params = new HttpParams();
    if (idParametrosSistema !== undefined) params = params.set('idParametrosSistema', idParametrosSistema.toString());
    if (keyword) params = params.set('keyword', keyword);
    return this.http.get<number>(`${this.baseUrl}/parametrosSistema/count`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllSystemParameters(idParametrosSistema?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<ParametrosSistemaI[]> {
    let params = new HttpParams().set('orderMode', orderMode);
    if (idParametrosSistema !== undefined) params = params.set('idParametrosSistema', idParametrosSistema.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<ParametrosSistemaI[]>(`${this.baseUrl}/parametrosSistema/lista`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllSystemParametersPag(page: number = 0, size: number = 10, idParametrosSistema?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<ParametrosSistemaI[]> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('orderMode', orderMode);
    if (idParametrosSistema !== undefined) params = params.set('idParametrosSistema', idParametrosSistema.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<any>(`${this.baseUrl}/parametrosSistema/listaPag`, { params }).pipe(
      map((slice: any) => slice.content as ParametrosSistemaI[])
    );
  }

  //CREAR REGISTRO.
  addSystemParameter(parametrosSistema: ParametrosSistemaI): Observable<ParametrosSistemaMsj> {
    return this.http.post<ParametrosSistemaMsj>(`${this.baseUrl}/parametrosSistema`, parametrosSistema);
  }

  //CONSULTAR REGISTRO POR ID.
  getSystemParameterbyId(idParametrosSistema: number): Observable<ResponseParametrosSistemaDTO> {
    return this.http.get<ResponseParametrosSistemaDTO>(`${this.baseUrl}/parametrosSistema/${idParametrosSistema}`);
  }

  //CONSULTAR REGISTRO POR SMTP HOST.
  getSystemParameterbySmtpHost(smtpHost: string): Observable<ResponseParametrosSistemaDTO> {
    return this.http.get<ResponseParametrosSistemaDTO>(`${this.baseUrl}/parametrosSistema/smtpHost/${smtpHost}`);
  }

  //MODIFICAR REGISTRO.
  updateSystemParameter(parametrosSistema: ParametrosSistemaI): Observable<ParametrosSistemaMsj> {
    return this.http.put<ParametrosSistemaMsj>(`${this.baseUrl}/parametrosSistema`, parametrosSistema);
  }

  //ELIMINAR REGISTRO.
  deleteSystemParameter(idParametrosSistema: number): Observable<ParametrosSistemaMsj> {
    return this.http.delete<ParametrosSistemaMsj>(`${this.baseUrl}/parametrosSistema/${idParametrosSistema}`);
  }

  //ENDPOINT PÚBLICO (SIN AUTENTICACIÓN) DEL FLUJO DE RECUPERACIÓN DE CONTRASEÑA: DEVUELVE SOLO EL TIEMPO DE
  //EXPIRACIÓN DEL CÓDIGO, NUNCA LOS DATOS SMTP NI LA PLANTILLA DEL CORREO (ESOS LOS ARMA EmailServiceImpl INTERNAMENTE):
  getPasswordRecoveryPublicDataSystemParameter(): Observable<ResponseParametrosSistemaRecuperacionContrasenaDTO> {
    return this.http.get<ResponseParametrosSistemaRecuperacionContrasenaDTO>(`${this.baseUrl}/parametrosSistema/datosPublicosRecuperacionContrasena`);
  }

}
