import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseHistorialMovimientoEmpleadoDTO } from '../../../interfaces/gestion-personal/historial-movimientos-empleados/responseHistorialMovimientoEmpleadoDTO.interface';
import { HistorialMovimientosEmpleadosI } from '../../../interfaces/gestion-personal/historial-movimientos-empleados/historialMovimientosEmpleados.interface';

@Injectable({
  providedIn: 'root'
})
export class HistorialMovimientosEmpleadosService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idHistorialMovimientoEmpleado?: number, keyword?: string): Observable<number> {
    let params = new HttpParams();
    if (idHistorialMovimientoEmpleado !== undefined) params = params.set('idHistorialMovimientoEmpleado', idHistorialMovimientoEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    return this.http.get<number>(`${this.baseUrl}/historialesMovimientosEmpleados/count`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllEmployeeMovementHistories(idHistorialMovimientoEmpleado?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<HistorialMovimientosEmpleadosI[]> {
    let params = new HttpParams().set('orderMode', orderMode);
    if (idHistorialMovimientoEmpleado !== undefined) params = params.set('idHistorialMovimientoEmpleado', idHistorialMovimientoEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<HistorialMovimientosEmpleadosI[]>(`${this.baseUrl}/historialesMovimientosEmpleados/lista`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllEmployeeMovementHistoriesPag(page: number = 0, size: number = 10, idHistorialMovimientoEmpleado?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<HistorialMovimientosEmpleadosI[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('orderMode', orderMode);
    if (idHistorialMovimientoEmpleado !== undefined) params = params.set('idHistorialMovimientoEmpleado', idHistorialMovimientoEmpleado.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<any>(`${this.baseUrl}/historialesMovimientosEmpleados/listaPag`, { params }).pipe(
      map((slice: any) => slice.content as HistorialMovimientosEmpleadosI[])
    );
  }

  //CREAR REGISTRO.
  addEmployeeMovementHistory(movimiento: HistorialMovimientosEmpleadosI): Observable<ResponseHistorialMovimientoEmpleadoDTO> {
    return this.http.post<ResponseHistorialMovimientoEmpleadoDTO>(`${this.baseUrl}/historialesMovimientosEmpleados`, movimiento);
  }

  //CONSULTAR REGISTRO POR ID.
  getEmployeeMovementHistorybyId(idHistorialMovimientoEmpleado: number): Observable<ResponseHistorialMovimientoEmpleadoDTO> {
    return this.http.get<ResponseHistorialMovimientoEmpleadoDTO>(`${this.baseUrl}/historialesMovimientosEmpleados/${idHistorialMovimientoEmpleado}`);
  }

  //MODIFICAR REGISTRO.
  updateEmployeeMovementHistory(movimiento: HistorialMovimientosEmpleadosI): Observable<ResponseHistorialMovimientoEmpleadoDTO> {
    return this.http.put<ResponseHistorialMovimientoEmpleadoDTO>(`${this.baseUrl}/historialesMovimientosEmpleados`, movimiento);
  }

  //ELIMINAR REGISTRO.
  deleteEmployeeMovementHistory(idHistorialMovimientoEmpleado: number): Observable<ResponseHistorialMovimientoEmpleadoDTO> {
    return this.http.delete<ResponseHistorialMovimientoEmpleadoDTO>(`${this.baseUrl}/historialesMovimientosEmpleados/${idHistorialMovimientoEmpleado}`);
  }
}
