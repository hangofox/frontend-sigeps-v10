import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseAuditoriaSistemaDTO } from '../../../interfaces/panel-control/auditorias-sistema/response-auditoria-sistema-dto.interface';
import { AuditoriaSistemaI, AuditoriaSistemaMsj } from '../../../interfaces/panel-control/auditorias-sistema/auditoria-sistema.interface';
import { SessionService } from '../../session/session.service';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable({
  providedIn: 'root'
})
export class AuditoriasSistemaService {

  private baseUrl = environment.baseUrl;

  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
    private usuariosService: UsuariosService
  ) {}

  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idAuditoriaSistema?: number, keyword?: string): Observable<number> {
    let params = new HttpParams();
    if (idAuditoriaSistema !== undefined) params = params.set('idAuditoriaSistema', idAuditoriaSistema.toString());
    if (keyword) params = params.set('keyword', keyword);
    return this.http.get<number>(`${this.baseUrl}/auditoriasSistema/count`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllSystemAudits(idAuditoriaSistema?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<AuditoriaSistemaI[]> {
    let params = new HttpParams().set('orderMode', orderMode);
    if (idAuditoriaSistema !== undefined) params = params.set('idAuditoriaSistema', idAuditoriaSistema.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<AuditoriaSistemaI[]>(`${this.baseUrl}/auditoriasSistema/lista`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllSystemAuditsPag(page: number = 0, size: number = 10, idAuditoriaSistema?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<AuditoriaSistemaI[]> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('orderMode', orderMode);
    if (idAuditoriaSistema !== undefined) params = params.set('idAuditoriaSistema', idAuditoriaSistema.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<any>(`${this.baseUrl}/auditoriasSistema/listaPag`, { params }).pipe(
      map((slice: any) => slice.content as AuditoriaSistemaI[])
    );
  }

  //CREAR REGISTRO.
  addSystemAudit(auditoria: AuditoriaSistemaI): Observable<AuditoriaSistemaMsj> {
    return this.http.post<AuditoriaSistemaMsj>(`${this.baseUrl}/auditoriasSistema`, auditoria);
  }

  //CONSULTAR REGISTRO POR ID.
  getSystemAuditbyId(idAuditoriaSistema: number): Observable<ResponseAuditoriaSistemaDTO> {
    return this.http.get<ResponseAuditoriaSistemaDTO>(`${this.baseUrl}/auditoriasSistema/${idAuditoriaSistema}`);
  }

  //MODIFICAR REGISTRO.
  updateSystemAudit(auditoria: AuditoriaSistemaI): Observable<AuditoriaSistemaMsj> {
    return this.http.put<AuditoriaSistemaMsj>(`${this.baseUrl}/auditoriasSistema`, auditoria);
  }

  //ELIMINAR REGISTRO.
  deleteSystemAudit(idAuditoriaSistema: number): Observable<AuditoriaSistemaMsj> {
    return this.http.delete<AuditoriaSistemaMsj>(`${this.baseUrl}/auditoriasSistema/${idAuditoriaSistema}`);
  }

  //MÉTODO REUTILIZABLE PARA REGISTRAR UNA AUDITORÍA DEL SISTEMA DESDE CUALQUIER COMPONENTE add-upd-del-* AL
  //CREAR, MODIFICAR O ELIMINAR UN REGISTRO. TOMA EL idUsuario DE LA SESIÓN ACTUAL (SessionService) Y CONSULTA
  //AL BACKEND EL REGISTRO COMPLETO Y REAL DE ESE USUARIO (UsuariosService.getUserbyId) PARA USARLO COMO
  //usuarioDTO — NO SE ARMA UN OBJETO MÍNIMO/INVENTADO SOLO CON idUsuario PORQUE SE CONFIRMÓ (PROBANDO EL MISMO
  //ENDPOINT EN POSTMAN CON EL usuarioDTO COMPLETO) QUE EL BACKEND VALIDA/USA DATOS DEL USUARIO QUE VIENEN EN EL
  //BODY (POR EJEMPLO estadoUsuario/tipoUsuarioDTO) PARA AUTORIZAR LA CREACIÓN DE LA AUDITORÍA: UN usuarioDTO
  //INCOMPLETO HACÍA QUE EL BACKEND RESPONDIERA 403 FORBIDDEN AUNQUE EL TOKEN FUERA VÁLIDO.
  //ES "DISPARAR Y OLVIDAR": SI FALLA, SOLO SE REGISTRA EN CONSOLA — NO DEBE BLOQUEAR NI MOSTRARLE NADA AL
  //USUARIO, YA QUE LA ACCIÓN PRINCIPAL (GUARDAR/MODIFICAR/ELIMINAR EL REGISTRO REAL) YA SE COMPLETÓ CON ÉXITO
  //ANTES DE LLAMAR A ESTE MÉTODO:
  registerSystemAudit(accionUsuarioSistema: string, descripcionAuditoriaSistema: string): void {
    const idUsuario = this.sessionService.getIdUsuario();
    const fechaHMSAuditoriaSistema = this.obtenerFechaHoraLocalActual();

    this.usuariosService.getUserbyId(idUsuario).subscribe({
      next: (respuestaUsuario) => {
        const auditoria: AuditoriaSistemaI = {
          fechaHMSAuditoriaSistema,
          accionUsuarioSistema,
          descripcionAuditoriaSistema,
          usuarioDTO: respuestaUsuario.usuarioDTO
        };
        this.addSystemAudit(auditoria).subscribe({
          error: (err) => console.error('ERROR AL REGISTRAR LA AUDITORÍA DEL SISTEMA: ', err)
        });
      },
      error: (err) => console.error('ERROR AL CONSULTAR EL USUARIO PARA REGISTRAR LA AUDITORÍA DEL SISTEMA: ', err)
    });
  }

  //DEVUELVE LA FECHA Y HORA LOCAL ACTUAL EN FORMATO ISO-8601 CON MILISEGUNDOS Y OFFSET DE ZONA HORARIA
  //(yyyy-MM-ddTHH:mm:ss.SSS±HH:mm, EJ. "2026-07-04T17:52:48.000-05:00"), QUE ES EL FORMATO EXACTO QUE ESPERA
  //EL BACKEND PARA DESERIALIZAR fechaHMSAuditoriaSistema (java.util.Date). ENVIAR "yyyy-MM-dd HH:mm:ss" (CON
  //ESPACIO, SIN 'T' NI OFFSET) HACÍA QUE JACKSON FALLARA AL PARSEAR EL JSON, Y ESE FALLO SE TRADUCÍA EN UN
  //403 (EL REENVÍO INTERNO DE SPRING A "/error" PIERDE LA AUTENTICACIÓN Y Http403ForbiddenEntryPoint LO RECHAZA).
  //A PROPÓSITO NO SE USA Date.toISOString() SOLO, YA QUE ESE MÉTODO DEVUELVE LA HORA EN UTC (SIN OFFSET LOCAL):
  //EN COLOMBIA (UTC-5) LA AUDITORÍA QUEDARÍA REGISTRADA 5 HORAS ADELANTADA RESPECTO AL MOMENTO REAL:
  private obtenerFechaHoraLocalActual(): string {
    const ahora = new Date();
    const dosDigitos = (valor: number): string => String(valor).padStart(2, '0');
    const fecha = `${ahora.getFullYear()}-${dosDigitos(ahora.getMonth() + 1)}-${dosDigitos(ahora.getDate())}`;
    const hora = `${dosDigitos(ahora.getHours())}:${dosDigitos(ahora.getMinutes())}:${dosDigitos(ahora.getSeconds())}`;
    const milisegundos = String(ahora.getMilliseconds()).padStart(3, '0');

    //OFFSET DE ZONA HORARIA LOCAL EN FORMATO ±HH:mm (getTimezoneOffset() DEVUELVE MINUTOS, POSITIVO SI ESTÁ
    //DETRÁS DE UTC, POR ESO SE NIEGA):
    const offsetMinutosTotal = -ahora.getTimezoneOffset();
    const signoOffset = offsetMinutosTotal >= 0 ? '+' : '-';
    const offsetHoras = dosDigitos(Math.floor(Math.abs(offsetMinutosTotal) / 60));
    const offsetMinutos = dosDigitos(Math.abs(offsetMinutosTotal) % 60);

    return `${fecha}T${hora}.${milisegundos}${signoOffset}${offsetHoras}:${offsetMinutos}`;
  }

}
