import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseCiudadMundoDTO } from '../../../../interfaces/paises-mundo/departamentos-estados-mundo/ciudades-mundo/responseCiudadesMundoDTO.interface';
import { CiudadesMundoI, CiudadesMundoMsj } from '../../../../interfaces/paises-mundo/departamentos-estados-mundo/ciudades-mundo/ciudades-mundo.interface';

@Injectable({
  providedIn: 'root'
})
export class CiudadesMundoService {
  
  //SI EL PROYECTO SE DESPLIEGA EN DESAROLLO ASIGNA LA IP DEL SERVIDOR DE DESARROLLO, SI EL PROYECTO SE DESPLIEGA EN PRUEBAS O PRODUCCIÓN TRAE LA IP DEL SERVIDOR DE PRUEBAS O PRODUCCIÓN:
  private baseUrl = environment.baseUrl;
  
  constructor(private http: HttpClient) {}
  
  //CONTADORES DE REGISTROS FILTRADOS.
  findCountTotalRegisters(idCiudadMundo?: number, idPaisMundo?: number, idDepartamentooEstadoMundo?: number, nombrePaisMundo?: string, nombreDepartamentooEstadoMundo?: string, keyword?: string): Observable<number> {
     let params = new HttpParams();
     if (idCiudadMundo !== undefined) params = params.set('idCiudadMundo', idCiudadMundo.toString());
     if (idPaisMundo !== undefined) params = params.set('idPaisMundo', idPaisMundo.toString());
     if (idDepartamentooEstadoMundo !== undefined) params = params.set('idDepartamentooEstadoMundo', idDepartamentooEstadoMundo.toString());
     if (nombrePaisMundo) params = params.set('nombrePaisMundo', nombrePaisMundo);
     if (nombreDepartamentooEstadoMundo) params = params.set('nombreDepartamentooEstadoMundo', nombreDepartamentooEstadoMundo);
     if (keyword) params = params.set('keyword', keyword);
     return this.http.get<number>(`${this.baseUrl}/ciudadesMundo/count`, { params });
  }
  
  //LISTADO DE REGISTROS FILTRADOS SIN PAGINACIÓN.
  findAllCitiesOfTheWorld(idCiudadMundo?: number, idPaisMundo?: number, idDepartamentooEstadoMundo?: number, nombrePaisMundo?: string, nombreDepartamentooEstadoMundo?: string, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<CiudadesMundoI[]> {
     let params = new HttpParams().set('orderMode', orderMode);
     if (idCiudadMundo !== undefined) params = params.set('idCiudadMundo', idCiudadMundo.toString());
     if (idPaisMundo !== undefined) params = params.set('idPaisMundo', idPaisMundo.toString());
     if (idDepartamentooEstadoMundo !== undefined) params = params.set('idDepartamentooEstadoMundo', idDepartamentooEstadoMundo.toString());
     if (nombrePaisMundo) params = params.set('nombrePaisMundo', nombrePaisMundo);
     if (nombreDepartamentooEstadoMundo) params = params.set('nombreDepartamentooEstadoMundo', nombreDepartamentooEstadoMundo);
     if (keyword) params = params.set('keyword', keyword);
     if (orderBy) params = params.set('orderBy', orderBy);
     return this.http.get<CiudadesMundoI[]>(`${this.baseUrl}/ciudadesMundo/lista`, { params });
  }
  
  //LISTADO DE REGISTROS FILTRADOS CON PAGINACIÓN.
  findAllCitiesOfTheWorldPag(page: number = 0, size: number = 10, idCiudadMundo?: number, idPaisMundo?: number, idDepartamentooEstadoMundo?: number, nombrePaisMundo?: string, nombreDepartamentooEstadoMundo?: string, keyword?: string, orderBy?: string, orderMode: string = 'ASC'): Observable<CiudadesMundoI[]> {
     let params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('orderMode', orderMode);
     if (idCiudadMundo !== undefined) params = params.set('idCiudadMundo', idCiudadMundo.toString());
     if (idPaisMundo !== undefined) params = params.set('idPaisMundo', idPaisMundo.toString());
     if (idDepartamentooEstadoMundo !== undefined) params = params.set('idDepartamentooEstadoMundo', idDepartamentooEstadoMundo.toString());
     if (nombrePaisMundo) params = params.set('nombrePaisMundo', nombrePaisMundo);
     if (nombreDepartamentooEstadoMundo) params = params.set('nombreDepartamentooEstadoMundo', nombreDepartamentooEstadoMundo);
     if (keyword) params = params.set('keyword', keyword);
     if (orderBy) params = params.set('orderBy', orderBy);
     return this.http.get<any>(`${this.baseUrl}/ciudadesMundo/listaPag`, { params }).pipe(
       map((slice: any) => slice.content as CiudadesMundoI[])
     );
  }
  
  //CREAR REGISTRO.
  addCityOfTheWorld(ciudad: CiudadesMundoI): Observable<CiudadesMundoMsj> {
     return this.http.post<CiudadesMundoMsj>(`${this.baseUrl}/ciudadesMundo`, ciudad);
  }
  
  //CONSULTAR REGISTRO POR ID.
  getCityOfTheWorldbyId(idCiudadMundo: number): Observable<ResponseCiudadMundoDTO> {
     return this.http.get<ResponseCiudadMundoDTO>(`${this.baseUrl}/ciudadesMundo/${idCiudadMundo}`);
  }
  
  //CONSULTAR REGISTRO POR ID DEL PAIS, ID DEL DEPARTAMENTO O ESTADO E ID DE LA CIUDAD DEL MUNDO.
  getCityOfTheWorldbyIdPaisMundoAndIdDepartamentooEstadoMundoAndIdCiudadMundo(idPaisMundo: number, idDepartamentooEstadoMundo: number, idCiudadMundo: number): Observable<ResponseCiudadMundoDTO> {
     return this.http.get<ResponseCiudadMundoDTO>(`${this.baseUrl}/ciudadesMundo/idPaisMundo/${idPaisMundo}/idDepartamentooEstadoMundo/${idDepartamentooEstadoMundo}/idCiudadMundo/${idCiudadMundo}`);
  }
  
  //CONSULTAR REGISTRO POR NOMBRE DEL PAIS, NOMBRE DEL DEPARTAMENTO O ESTADO Y NOMBRE DE LA CIUDAD DEL MUNDO.
  getCityOfTheWorldbyNombrePaisMundoAndNombreDepartamentooEstadoMundoAndNombreCiudadMundo(nombrePaisMundo: string, nombreDepartamentooEstadoMundo: string, nombreCiudadMundo: string): Observable<ResponseCiudadMundoDTO> {
     return this.http.get<ResponseCiudadMundoDTO>(`${this.baseUrl}/ciudadesMundo/nombrePaisMundo/${nombrePaisMundo}/nombreDepartamentooEstadoMundo/${nombreDepartamentooEstadoMundo}/nombreCiudadMundo/${nombreCiudadMundo}`);
  }
  
  //MODIFICAR REGISTRO.
  updateCityOfTheWorld(ciudad: CiudadesMundoI): Observable<CiudadesMundoMsj> {
     return this.http.put<CiudadesMundoMsj>(`${this.baseUrl}/ciudadesMundo`, ciudad);
  }
  
  //ELIMINAR REGISTRO.
  deleteCityOfTheWorld(idCiudadMundo: number): Observable<CiudadesMundoMsj> {
     return this.http.delete<CiudadesMundoMsj>(`${this.baseUrl}/ciudadesMundo/${idCiudadMundo}`);
  }
  
}
