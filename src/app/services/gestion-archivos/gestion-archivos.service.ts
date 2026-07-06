import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
//import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseCrearCarpetaDTO } from '../../interfaces/gestion-archivos/crear-carpetas/responseCrearCarpetaDTO.interface';
import { CrearCarpetasI } from '../../interfaces/gestion-archivos/crear-carpetas/crear-carpetas.interface';
//import { SubirCarpetasI, SubirCarpetasMsj } from '../../interfaces/gestion-archivos/crear-carpetas/crear-carpetas.interface';
import { ResponseRenombrarCarpetaDTO } from '../../interfaces/gestion-archivos/renombrar-carpetas/responseRenombrarCarpetaDTO.interface';
import { RenombrarCarpetasI } from '../../interfaces/gestion-archivos/renombrar-carpetas/renombrar-carpetas.interface';
//import { RenombrarCarpetasI, RenombrarCarpetasMsj } from '../../interfaces/gestion-archivos/renombrar-carpetas/renombrar-carpetas.interface';
import { ResponseEliminarCarpetaDTO } from '../../interfaces/gestion-archivos/eliminar-carpetas/responseEliminarCarpetaDTO.interface';
import { EliminarCarpetasI } from '../../interfaces/gestion-archivos/eliminar-carpetas/eliminar-carpetas.interface';
//import { EliminarCarpetasI, EliminarCarpetasMsj } from '../../interfaces/gestion-archivos/eliminar-carpetas/eliminar-carpetas.interface';
import { ResponseObtenerArchivoDTO } from '../../interfaces/gestion-archivos/obtener-archivos/responseObtenerArchivoDTO.interface';
//import { ObtenerArchivosI } from '../../interfaces/gestion-archivos/obtener-archivos/obtener-archivos.interface';
//import { ObtenerArchivosI, ObtenerArchivosMsj } from '../../interfaces/gestion-archivos/obtener-archivos/obtener-archivos.interface';
import { ResponseSubirArchivoDTO } from '../../interfaces/gestion-archivos/subir-archivos/responseSubirArchivoDTO.interface';
//import { SubirArchivosI } from '../../interfaces/gestion-archivos/subir-archivos/subir-archivos.interface';
//import { SubirArchivosI, SubirArchivosMsj } from '../../interfaces/gestion-archivos/subir-archivos/subir-archivos.interface';
import { ResponseMoverArchivoDTO } from '../../interfaces/gestion-archivos/mover-archivos/responseMoverArchivoDTO.interface';
import { MoverArchivosI } from '../../interfaces/gestion-archivos/mover-archivos/mover-archivos.interface';
//import { MoverArchivosI, MoverArchivosMsj } from '../../interfaces/gestion-archivos/mover-archivos/mover-archivos.interface';
import { ResponseRenombrarArchivoDTO } from '../../interfaces/gestion-archivos/renombrar-archivos/responseRenombrarArchivoDTO.interface';
import { RenombrarArchivosI } from '../../interfaces/gestion-archivos/renombrar-archivos/renombrar-archivos.interface';
//import { RenombrarArchivosI, MoverArchivosMsj } from '../../interfaces/gestion-archivos/renombrar-archivos/renombrar-archivos.interface';
import { ResponseEliminarArchivoDTO } from '../../interfaces/gestion-archivos/eliminar-archivos/responseEliminarArchivoDTO.interface';
import { EliminarArchivosI } from '../../interfaces/gestion-archivos/eliminar-archivos/eliminar-archivos.interface';
//import { EliminarArchivosI, MoverArchivosMsj } from '../../interfaces/gestion-archivos/renombrar-archivos/renombrar-archivos.interface';

@Injectable({
  providedIn: 'root'
})
export class GestionArchivosService {
  
  //SI EL PROYECTO SE DESPLIEGA EN DESAROLLO ASIGNA LA IP DEL SERVIDOR DE DESARROLLO, SI EL PROYECTO SE DESPLIEGA EN PRUEBAS O PRODUCCIÓN TRAE LA IP DEL SERVIDOR DE PRUEBAS O PRODUCCIÓN:
  private baseUrl = environment.baseUrl;
  
  constructor(private http: HttpClient) {}
  
  //CREAR CARPETA:
  createFolder(crearCarpetas: CrearCarpetasI) {
     return this.http.post<ResponseCrearCarpetaDTO>(`${this.baseUrl}/files/create-folder`, crearCarpetas);
  }
  
  //RENOMBRAR CARPETA:
  renameFolder(renombrarCarpetas: RenombrarCarpetasI) {
     return this.http.post<ResponseRenombrarCarpetaDTO>(`${this.baseUrl}/files/rename-folder`, renombrarCarpetas);
  }
  
  //ELIMINAR CARPETA (RECURSIVAMENTE):
  deleteFolder(eliminarCarpetas: EliminarCarpetasI) {
     return this.http.request<ResponseEliminarCarpetaDTO>('DELETE', `${this.baseUrl}/files/delete-folder`, {
       body: eliminarCarpetas
     });
  }
  
  //OBTENCIÓN DE ARCHIVO:
  getFile(rutaArchivo: String): Observable<ResponseObtenerArchivoDTO> {
       return this.http.get<ResponseObtenerArchivoDTO>(`${this.baseUrl}/files/set-static-path?path=${rutaArchivo}`);
  }
  
  //SUBIR ARCHIVO:
  uploadFile(file: File, path: any) {
    const formData = new FormData();
    formData.append('file', file);//Nombre debe coincidir con @RequestParam("file").
    formData.append('path', path);//Nombre debe coincidir con @RequestParam("path").
    
    return this.http.post<ResponseSubirArchivoDTO>(`${this.baseUrl}/files/upload-file`, formData);
  }
  
  //MOVER ARCHIVO:
  moveFile(moverArchivos: MoverArchivosI) {
     return this.http.post<ResponseMoverArchivoDTO>(`${this.baseUrl}/files/move-file`, moverArchivos);
  }
  
  //RENOMBRAR ARCHIVO:
  renameFile(renombrarArchivos: RenombrarArchivosI) {
     return this.http.post<ResponseRenombrarArchivoDTO>(`${this.baseUrl}/files/rename-file`, renombrarArchivos);
  }
  
  //ELIMINAR ARCHIVO:
  deleteFile(eliminarArchivos: EliminarArchivosI) {
     return this.http.request<ResponseEliminarArchivoDTO>('DELETE', `${this.baseUrl}/files/delete-file`, {
       body: eliminarArchivos
     });
  }

}
