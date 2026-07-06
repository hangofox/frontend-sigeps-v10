import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseProgramacionTurnoEmpleadoDTO } from '../../../interfaces/gestion-personal/programaciones-turnos-empleados/responseProgramacionTurnoEmpleadoDTO.interface';
import { ProgramacionTurnoEmpleadoI, ProgramacionTurnoEmpleadoMsj } from '../../../interfaces/gestion-personal/programaciones-turnos-empleados/programaciones-turnos-empleados.interface';

@Injectable({
  providedIn: 'root'
})
export class ProgramacionesTurnosEmpleadosService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idProgramacionTurnoEmpleado?: number, keyword?: string): Observable<number> {
    let params = new HttpParams();
    if (idProgramacionTurnoEmpleado !== undefined) params = params.set('idProgramacionTurnoEmpleado', idProgramacionTurnoEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    return this.http.get<number>(`${this.baseUrl}/programacionesTurnosEmpleados/count`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllEmployeeShiftSchedules(idProgramacionTurnoEmpleado?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<ProgramacionTurnoEmpleadoI[]> {
    let params = new HttpParams().set('orderMode', orderMode);
    if (idProgramacionTurnoEmpleado !== undefined) params = params.set('idProgramacionTurnoEmpleado', idProgramacionTurnoEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<ProgramacionTurnoEmpleadoI[]>(`${this.baseUrl}/programacionesTurnosEmpleados/lista`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllEmployeeShiftSchedulesPag(page: number = 0, size: number = 10, idProgramacionTurnoEmpleado?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<ProgramacionTurnoEmpleadoI[]> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('orderMode', orderMode);
    if (idProgramacionTurnoEmpleado !== undefined) params = params.set('idProgramacionTurnoEmpleado', idProgramacionTurnoEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<any>(`${this.baseUrl}/programacionesTurnosEmpleados/listaPag`, { params }).pipe(
      map((slice: any) => slice.content as ProgramacionTurnoEmpleadoI[])
    );
  }

  //CREAR REGISTRO.
  addEmployeeShiftSchedule(programacion: ProgramacionTurnoEmpleadoI): Observable<ProgramacionTurnoEmpleadoMsj> {
    return this.http.post<ProgramacionTurnoEmpleadoMsj>(`${this.baseUrl}/programacionesTurnosEmpleados`, programacion);
  }

  //CONSULTAR REGISTRO POR ID.
  getEmployeeShiftSchedulebyId(idProgramacionTurnoEmpleado: number): Observable<ResponseProgramacionTurnoEmpleadoDTO> {
    return this.http.get<ResponseProgramacionTurnoEmpleadoDTO>(`${this.baseUrl}/programacionesTurnosEmpleados/${idProgramacionTurnoEmpleado}`);
  }

  //CONSULTAR REGISTRO POR ID DE EMPLEADO Y NOMBRE DE TURNO.
  getEmployeeShiftSchedulebyIdEmpleadoAndNombreTurno(idEmpleado: number, nombreTurno: string): Observable<ResponseProgramacionTurnoEmpleadoDTO> {
    return this.http.get<ResponseProgramacionTurnoEmpleadoDTO>(
      `${this.baseUrl}/programacionesTurnosEmpleados/idEmpleado/${idEmpleado}/nombreTurno/${nombreTurno}`
    );
  }

  //MODIFICAR REGISTRO.
  updateEmployeeShiftSchedule(programacion: ProgramacionTurnoEmpleadoI): Observable<ProgramacionTurnoEmpleadoMsj> {
    return this.http.put<ProgramacionTurnoEmpleadoMsj>(`${this.baseUrl}/programacionesTurnosEmpleados`, programacion);
  }

  //ELIMINAR REGISTRO.
  deleteEmployeeShiftSchedule(idProgramacionTurnoEmpleado: number): Observable<ProgramacionTurnoEmpleadoMsj> {
    return this.http.delete<ProgramacionTurnoEmpleadoMsj>(`${this.baseUrl}/programacionesTurnosEmpleados/${idProgramacionTurnoEmpleado}`);
  }

}
