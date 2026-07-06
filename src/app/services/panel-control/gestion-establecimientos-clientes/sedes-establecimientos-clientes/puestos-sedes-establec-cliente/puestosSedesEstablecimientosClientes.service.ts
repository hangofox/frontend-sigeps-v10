import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponsePuestoSedeEstablecimientoClienteDTO } from '../../../../../interfaces/panel-control/gestion-establecimientos-clientes/sedes-establecimientos-clientes/puestos-sedes-establec-clientes/responsePuestoSedeEstablecimientoClienteDTO.interface';
import { PuestoSedeEstablecimientoClienteI, PuestoSedeEstablecimientoClienteMsj } from '../../../../../interfaces/panel-control/gestion-establecimientos-clientes/sedes-establecimientos-clientes/puestos-sedes-establec-clientes/puestos-sedes-establec-cliente.interface';

@Injectable({
  providedIn: 'root'
})
export class PuestosSedesEstablecimientosClientesService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idPuestoSedeEstablecimientoCliente?: number, keyword?: string): Observable<number> {
    let params = new HttpParams();
    if (idPuestoSedeEstablecimientoCliente !== undefined) params = params.set('idPuestoSedeEstablecimientoCliente', idPuestoSedeEstablecimientoCliente.toString());
    if (keyword) params = params.set('keyword', keyword);
    return this.http.get<number>(`${this.baseUrl}/puestosSedesEstablecimientosClientes/count`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllClientEstablishmentBranchPosts(idPuestoSedeEstablecimientoCliente?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<PuestoSedeEstablecimientoClienteI[]> {
    let params = new HttpParams().set('orderMode', orderMode);
    if (idPuestoSedeEstablecimientoCliente !== undefined) params = params.set('idPuestoSedeEstablecimientoCliente', idPuestoSedeEstablecimientoCliente.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<PuestoSedeEstablecimientoClienteI[]>(`${this.baseUrl}/puestosSedesEstablecimientosClientes/lista`, { params });
  }

  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllClientEstablishmentBranchPostsPag(page: number = 0, size: number = 10, idPuestoSedeEstablecimientoCliente?: number, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<PuestoSedeEstablecimientoClienteI[]> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('orderMode', orderMode);
    if (idPuestoSedeEstablecimientoCliente !== undefined) params = params.set('idPuestoSedeEstablecimientoCliente', idPuestoSedeEstablecimientoCliente.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (orderBy) params = params.set('orderBy', orderBy);
    return this.http.get<any>(`${this.baseUrl}/puestosSedesEstablecimientosClientes/listaPag`, { params }).pipe(
      map((slice: any) => slice.content as PuestoSedeEstablecimientoClienteI[])
    );
  }

  //CREAR REGISTRO.
  addClientEstablishmentBranchPost(puesto: PuestoSedeEstablecimientoClienteI): Observable<PuestoSedeEstablecimientoClienteMsj> {
    return this.http.post<PuestoSedeEstablecimientoClienteMsj>(`${this.baseUrl}/puestosSedesEstablecimientosClientes`, puesto);
  }

  //CONSULTAR REGISTRO POR ID.
  getClientEstablishmentBranchPostbyId(idPuestoSedeEstablecimientoCliente: number): Observable<ResponsePuestoSedeEstablecimientoClienteDTO> {
    return this.http.get<ResponsePuestoSedeEstablecimientoClienteDTO>(`${this.baseUrl}/puestosSedesEstablecimientosClientes/${idPuestoSedeEstablecimientoCliente}`);
  }

  //CONSULTAR REGISTRO POR NOMBRE.
  getClientEstablishmentBranchPostbyNombre(nombrePuestoSedeEstablecimientoCliente: string): Observable<ResponsePuestoSedeEstablecimientoClienteDTO> {
    return this.http.get<ResponsePuestoSedeEstablecimientoClienteDTO>(
      `${this.baseUrl}/puestosSedesEstablecimientosClientes/nombre/${nombrePuestoSedeEstablecimientoCliente}`
    );
  }

  //MODIFICAR REGISTRO.
  updateClientEstablishmentBranchPost(puesto: PuestoSedeEstablecimientoClienteI): Observable<PuestoSedeEstablecimientoClienteMsj> {
    return this.http.put<PuestoSedeEstablecimientoClienteMsj>(`${this.baseUrl}/puestosSedesEstablecimientosClientes`, puesto);
  }

  //ELIMINAR REGISTRO.
  deleteClientEstablishmentBranchPost(idPuestoSedeEstablecimientoCliente: number): Observable<PuestoSedeEstablecimientoClienteMsj> {
    return this.http.delete<PuestoSedeEstablecimientoClienteMsj>(`${this.baseUrl}/puestosSedesEstablecimientosClientes/${idPuestoSedeEstablecimientoCliente}`);
  }

}
