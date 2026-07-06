import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseEstablecimientoClienteDTO } from '../../../interfaces/panel-control/gestion-establecimientos-clientes/responseEstablecimientoClienteDTO.interface';
import { EstablecimientoClienteI, EstablecimientoClienteMsj } from '../../../interfaces/panel-control/gestion-establecimientos-clientes/establecimientos-clientes.interface';

@Injectable({
  providedIn: 'root'
})
export class EstablecimientosClientesService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idEstablecimientoCliente?: number, keyword?: string): Observable<number> {
    let params = new HttpParams();
    if (idEstablecimientoCliente !== undefined) params = params.set('idEstablecimientoCliente', idEstablecimientoCliente.toString());
    if (keyword) params = params.set('keyword', keyword);
    return this.http.get<number>(`${this.baseUrl}/establecimientosClientes/count`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllClientEstablishments(idEstablecimientoCliente?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<EstablecimientoClienteI[]> {
    let params = new HttpParams().set('orderMode', orderMode);
    if (idEstablecimientoCliente !== undefined) params = params.set('idEstablecimientoCliente', idEstablecimientoCliente.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<EstablecimientoClienteI[]>(`${this.baseUrl}/establecimientosClientes/lista`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllClientEstablishmentsPag(page: number = 0, size: number = 10, idEstablecimientoCliente?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<EstablecimientoClienteI[]> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('orderMode', orderMode);
    if (idEstablecimientoCliente !== undefined) params = params.set('idEstablecimientoCliente', idEstablecimientoCliente.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<any>(`${this.baseUrl}/establecimientosClientes/listaPag`, { params }).pipe(
      map((slice: any) => slice.content as EstablecimientoClienteI[])
    );
  }

  //CREAR REGISTRO.
  addClientEstablishment(establecimiento: EstablecimientoClienteI): Observable<EstablecimientoClienteMsj> {
    return this.http.post<EstablecimientoClienteMsj>(`${this.baseUrl}/establecimientosClientes`, establecimiento);
  }

  //CONSULTAR REGISTRO POR ID.
  getClientEstablishmentbyId(idEstablecimientoCliente: number): Observable<ResponseEstablecimientoClienteDTO> {
    return this.http.get<ResponseEstablecimientoClienteDTO>(`${this.baseUrl}/establecimientosClientes/${idEstablecimientoCliente}`);
  }

  //CONSULTAR REGISTRO POR NÚMERO DE DOCUMENTO DE IDENTIFICACIÓN.
  getClientEstablishmentbyNumeroDocumentoIdentificacion(numeroDocumentoIdentificacionEstablecimientoCliente: string): Observable<ResponseEstablecimientoClienteDTO> {
    return this.http.get<ResponseEstablecimientoClienteDTO>(
      `${this.baseUrl}/establecimientosClientes/numeroDocumento/${numeroDocumentoIdentificacionEstablecimientoCliente}`
    );
  }

  //MODIFICAR REGISTRO.
  updateClientEstablishment(establecimiento: EstablecimientoClienteI): Observable<EstablecimientoClienteMsj> {
    return this.http.put<EstablecimientoClienteMsj>(`${this.baseUrl}/establecimientosClientes`, establecimiento);
  }

  //ELIMINAR REGISTRO.
  deleteClientEstablishment(idEstablecimientoCliente: number): Observable<EstablecimientoClienteMsj> {
    return this.http.delete<EstablecimientoClienteMsj>(`${this.baseUrl}/establecimientosClientes/${idEstablecimientoCliente}`);
  }

}
