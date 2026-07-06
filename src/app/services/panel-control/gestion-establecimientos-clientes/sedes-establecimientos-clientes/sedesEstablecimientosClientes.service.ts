import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseSedeEstablecimientoClienteDTO } from '../../../../interfaces/panel-control/gestion-establecimientos-clientes/sedes-establecimientos-clientes/responseSedeEstablecimientoClienteDTO.interface';
import { SedeEstablecimientoClienteI, SedeEstablecimientoClienteMsj } from '../../../../interfaces/panel-control/gestion-establecimientos-clientes/sedes-establecimientos-clientes/sedes-establecimientos-clientes.interface';

@Injectable({
  providedIn: 'root'
})
export class SedesEstablecimientosClientesService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idSedeEstablecimientoCliente?: number, keyword?: string): Observable<number> {
    let params = new HttpParams();
    if (idSedeEstablecimientoCliente !== undefined) params = params.set('idSedeEstablecimientoCliente', idSedeEstablecimientoCliente.toString());
    if (keyword) params = params.set('keyword', keyword);
    return this.http.get<number>(`${this.baseUrl}/sedesEstablecimientosClientes/count`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllClientEstablishmentBranches(idSedeEstablecimientoCliente?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<SedeEstablecimientoClienteI[]> {
    let params = new HttpParams().set('orderMode', orderMode);
    if (idSedeEstablecimientoCliente !== undefined) params = params.set('idSedeEstablecimientoCliente', idSedeEstablecimientoCliente.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<SedeEstablecimientoClienteI[]>(`${this.baseUrl}/sedesEstablecimientosClientes/lista`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllClientEstablishmentBranchesPag(page: number = 0, size: number = 10, idSedeEstablecimientoCliente?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<SedeEstablecimientoClienteI[]> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('orderMode', orderMode);
    if (idSedeEstablecimientoCliente !== undefined) params = params.set('idSedeEstablecimientoCliente', idSedeEstablecimientoCliente.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<any>(`${this.baseUrl}/sedesEstablecimientosClientes/listaPag`, { params }).pipe(
      map((slice: any) => slice.content as SedeEstablecimientoClienteI[])
    );
  }

  //CREAR REGISTRO.
  addClientEstablishmentBranch(sede: SedeEstablecimientoClienteI): Observable<SedeEstablecimientoClienteMsj> {
    return this.http.post<SedeEstablecimientoClienteMsj>(`${this.baseUrl}/sedesEstablecimientosClientes`, sede);
  }

  //CONSULTAR REGISTRO POR ID.
  getClientEstablishmentBranchbyId(idSedeEstablecimientoCliente: number): Observable<ResponseSedeEstablecimientoClienteDTO> {
    return this.http.get<ResponseSedeEstablecimientoClienteDTO>(`${this.baseUrl}/sedesEstablecimientosClientes/${idSedeEstablecimientoCliente}`);
  }

  //CONSULTAR REGISTRO POR NOMBRE.
  getClientEstablishmentBranchbyNombre(nombreSedeEstablecimientoCliente: string): Observable<ResponseSedeEstablecimientoClienteDTO> {
    return this.http.get<ResponseSedeEstablecimientoClienteDTO>(
      `${this.baseUrl}/sedesEstablecimientosClientes/nombre/${nombreSedeEstablecimientoCliente}`
    );
  }

  //MODIFICAR REGISTRO.
  updateClientEstablishmentBranch(sede: SedeEstablecimientoClienteI): Observable<SedeEstablecimientoClienteMsj> {
    return this.http.put<SedeEstablecimientoClienteMsj>(`${this.baseUrl}/sedesEstablecimientosClientes`, sede);
  }

  //ELIMINAR REGISTRO.
  deleteClientEstablishmentBranch(idSedeEstablecimientoCliente: number): Observable<SedeEstablecimientoClienteMsj> {
    return this.http.delete<SedeEstablecimientoClienteMsj>(`${this.baseUrl}/sedesEstablecimientosClientes/${idSedeEstablecimientoCliente}`);
  }

}
