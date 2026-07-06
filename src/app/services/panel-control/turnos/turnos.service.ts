import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseTurnoDTO } from '../../../interfaces/panel-control/turnos/responseTurnoDTO.interface';
import { TurnosI, TurnosMsj } from '../../../interfaces/panel-control/turnos/turnos.interface';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idTurno?: number, keyword?: string): Observable<number> {
    let params = new HttpParams();
    if (idTurno !== undefined) params = params.set('idTurno', idTurno.toString());
    if (keyword) params = params.set('keyword', keyword);
    return this.http.get<number>(`${this.baseUrl}/turnos/count`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllShifts(idTurno?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<TurnosI[]> {
    let params = new HttpParams().set('orderMode', orderMode);
    if (idTurno !== undefined) params = params.set('idTurno', idTurno.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<TurnosI[]>(`${this.baseUrl}/turnos/lista`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllShiftsPag(page: number = 0, size: number = 10, idTurno?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<TurnosI[]> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('orderMode', orderMode);
    if (idTurno !== undefined) params = params.set('idTurno', idTurno.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<any>(`${this.baseUrl}/turnos/listaPag`, { params }).pipe(
      map((slice: any) => slice.content as TurnosI[])
    );
  }

  //CREAR REGISTRO.
  addShift(turno: TurnosI): Observable<TurnosMsj> {
    return this.http.post<TurnosMsj>(`${this.baseUrl}/turnos`, turno);
  }

  //CONSULTAR REGISTRO POR ID.
  getShiftbyId(idTurno: number): Observable<ResponseTurnoDTO> {
    return this.http.get<ResponseTurnoDTO>(`${this.baseUrl}/turnos/${idTurno}`);
  }

  //CONSULTAR REGISTRO POR NOMBRE.
  getShiftbyNombre(nombreTurno: string): Observable<ResponseTurnoDTO> {
    return this.http.get<ResponseTurnoDTO>(`${this.baseUrl}/turnos/nombre/${nombreTurno}`);
  }

  //MODIFICAR REGISTRO.
  updateShift(turno: TurnosI): Observable<TurnosMsj> {
    return this.http.put<TurnosMsj>(`${this.baseUrl}/turnos`, turno);
  }

  //ELIMINAR REGISTRO.
  deleteShift(idTurno: number): Observable<TurnosMsj> {
    return this.http.delete<TurnosMsj>(`${this.baseUrl}/turnos/${idTurno}`);
  }

}
