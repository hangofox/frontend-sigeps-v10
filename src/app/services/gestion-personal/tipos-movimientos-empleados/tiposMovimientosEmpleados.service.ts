import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseTipoMovimientoEmpleadoDTO } from '../../../interfaces/gestion-personal/tipos-movimientos-empleados/responseTipoMovimientoEmpleadoDTO.interface';
import { TipoMovimientoI, TipoMovimientoMsj } from '../../../interfaces/gestion-personal/tipos-movimientos-empleados/tipos-movimientos-empleados.interface';

@Injectable({
  providedIn: 'root'
})
export class TiposMovimientosEmpleadosService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idTipoMovimiento?: number, keyword?: string): Observable<number> {
    let params = new HttpParams();
    if (idTipoMovimiento !== undefined) params = params.set('idTipoMovimiento', idTipoMovimiento.toString());
    if (keyword) params = params.set('keyword', keyword);
    return this.http.get<number>(`${this.baseUrl}/tiposMovimientos/count`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllTypesOfEmployeeMovements(idTipoMovimiento?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<TipoMovimientoI[]> {
    let params = new HttpParams().set('orderMode', orderMode);
    if (idTipoMovimiento !== undefined) params = params.set('idTipoMovimiento', idTipoMovimiento.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<TipoMovimientoI[]>(`${this.baseUrl}/tiposMovimientos/lista`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllTypesOfEmployeeMovementsPag(page: number = 0, size: number = 10, idTipoMovimiento?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<TipoMovimientoI[]> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('orderMode', orderMode);
    if (idTipoMovimiento !== undefined) params = params.set('idTipoMovimiento', idTipoMovimiento.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<any>(`${this.baseUrl}/tiposMovimientos/listaPag`, { params }).pipe(
      map((slice: any) => slice.content as TipoMovimientoI[])
    );
  }

  //CREAR REGISTRO.
  addTypeOfEmployeeMovement(tipoMovimiento: TipoMovimientoI): Observable<TipoMovimientoMsj> {
    return this.http.post<TipoMovimientoMsj>(`${this.baseUrl}/tiposMovimientos`, tipoMovimiento);
  }

  //CONSULTAR REGISTRO POR ID.
  getTypeOfEmployeeMovementbyId(idTipoMovimiento: number): Observable<ResponseTipoMovimientoEmpleadoDTO> {
    return this.http.get<ResponseTipoMovimientoEmpleadoDTO>(`${this.baseUrl}/tiposMovimientos/${idTipoMovimiento}`);
  }

  //CONSULTAR REGISTRO POR NOMBRE.
  getTypeOfEmployeeMovementbyNombre(nombreTipoMovimiento: string): Observable<ResponseTipoMovimientoEmpleadoDTO> {
    return this.http.get<ResponseTipoMovimientoEmpleadoDTO>(`${this.baseUrl}/tiposMovimientos/nombre/${nombreTipoMovimiento}`);
  }

  //MODIFICAR REGISTRO.
  updateTypeOfEmployeeMovement(tipoMovimiento: TipoMovimientoI): Observable<TipoMovimientoMsj> {
    return this.http.put<TipoMovimientoMsj>(`${this.baseUrl}/tiposMovimientos`, tipoMovimiento);
  }

  //ELIMINAR REGISTRO.
  deleteTypeOfEmployeeMovement(idTipoMovimiento: number): Observable<TipoMovimientoMsj> {
    return this.http.delete<TipoMovimientoMsj>(`${this.baseUrl}/tiposMovimientos/${idTipoMovimiento}`);
  }

}
