import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
//import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseCrearCarpetaDTO } from '../../interfaces/gestion-archivos/crear-carpetas/responseCrearCarpetaDTO.interface';
import { CrearCarpetasI } from '../../interfaces/gestion-archivos/crear-carpetas/crear-carpetas.interface';
import { ResponseRenombrarCarpetaDTO } from '../../interfaces/gestion-archivos/renombrar-carpetas/responseRenombrarCarpetaDTO.interface';
import { RenombrarCarpetasI } from '../../interfaces/gestion-archivos/renombrar-carpetas/renombrar-carpetas.interface';
import { ResponseEliminarCarpetaDTO } from '../../interfaces/gestion-archivos/eliminar-carpetas/responseEliminarCarpetaDTO.interface';
import { EliminarCarpetasI } from '../../interfaces/gestion-archivos/eliminar-carpetas/eliminar-carpetas.interface';
import { ResponseObtenerArchivoDTO } from '../../interfaces/gestion-archivos/obtener-archivos/responseObtenerArchivoDTO.interface';
import { ResponseSubirArchivoDTO } from '../../interfaces/gestion-archivos/subir-archivos/responseSubirArchivoDTO.interface';
import { ResponseMoverArchivoDTO } from '../../interfaces/gestion-archivos/mover-archivos/responseMoverArchivoDTO.interface';
import { MoverArchivosI } from '../../interfaces/gestion-archivos/mover-archivos/mover-archivos.interface';
import { ResponseRenombrarArchivoDTO } from '../../interfaces/gestion-archivos/renombrar-archivos/responseRenombrarArchivoDTO.interface';
import { RenombrarArchivosI } from '../../interfaces/gestion-archivos/renombrar-archivos/renombrar-archivos.interface';
import { ResponseEliminarArchivoDTO } from '../../interfaces/gestion-archivos/eliminar-archivos/responseEliminarArchivoDTO.interface';
import { EliminarArchivosI } from '../../interfaces/gestion-archivos/eliminar-archivos/eliminar-archivos.interface';

//SERVICIO QUE CONSUME EL FileController DEL BACKEND (@RequestMapping("/files")) — VER
//src/app/services/controller/FileController.java PARA EL CONTRATO EXACTO DE CADA ENDPOINT.
@Injectable({
  providedIn: 'root'
})
export class GestionArchivosService {

  //SI EL PROYECTO SE DESPLIEGA EN DESAROLLO ASIGNA LA IP DEL SERVIDOR DE DESARROLLO, SI EL PROYECTO SE DESPLIEGA EN PRUEBAS O PRODUCCIÓN TRAE LA IP DEL SERVIDOR DE PRUEBAS O PRODUCCIÓN:
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  //CREAR CARPETA (POST /files/carpetas, BODY { folderPath }):
  createFolder(crearCarpetas: CrearCarpetasI) {
     return this.http.post<ResponseCrearCarpetaDTO>(`${this.baseUrl}/files/carpetas`, crearCarpetas);
  }

  //RENOMBRAR CARPETA (PUT /files/carpetas, BODY { oldPath, newPath }):
  renameFolder(renombrarCarpetas: RenombrarCarpetasI) {
     return this.http.put<ResponseRenombrarCarpetaDTO>(`${this.baseUrl}/files/carpetas`, renombrarCarpetas);
  }

  //ELIMINAR CARPETA RECURSIVAMENTE (DELETE /files/carpetas, BODY { folderPath }):
  deleteFolder(eliminarCarpetas: EliminarCarpetasI) {
     return this.http.request<ResponseEliminarCarpetaDTO>('DELETE', `${this.baseUrl}/files/carpetas`, {
       body: eliminarCarpetas
     });
  }

  //OBTENCIÓN DE LA RUTA ESTÁTICA DE UN ARCHIVO YA ALMACENADO (GET /files/archivos/rutaEstatica?path=...):
  //LA RUTA DEVUELTA (respuesta.rutaEstatica, EJ. "/files/archivos/aplicaciones1/.../foto.png") ES RELATIVA AL
  //BACKEND Y SE USA CON getFileBytes() PARA TRAER EL ARCHIVO YA AUTENTICADO (VER NOTA DE ESE MÉTODO).
  getFile(rutaArchivo: String): Observable<ResponseObtenerArchivoDTO> {
       const params = new HttpParams().set('path', String(rutaArchivo));
       return this.http.get<ResponseObtenerArchivoDTO>(`${this.baseUrl}/files/archivos/rutaEstatica`, { params });
  }

  //DESCARGA LOS BYTES DEL ARCHIVO YA RESUELTO POR getFile() (rutaEstatica) A TRAVÉS DE this.baseUrl (EL MISMO
  //PROXY /api QUE USAN TODAS LAS DEMÁS PETICIONES), PARA QUE EL AuthInterceptor LE ADJUNTE EL TOKEN DE AUTORIZACIÓN.
  //NO SE PUEDE USAR UN <img [src]> APUNTANDO DIRECTO AL SERVIDOR DE ARCHIVOS PORQUE LAS ETIQUETAS <img> NO ENVÍAN
  //CABECERAS PERSONALIZADAS, Y ESE ENDPOINT REQUIERE AUTENTICACIÓN EN EL BACKEND:
  getFileBytes(rutaEstatica: String): Observable<Blob> {
       return this.http.get(`${this.baseUrl}${rutaEstatica}`, { responseType: 'blob' });
  }

  //SUBIR ARCHIVO (POST /files/archivos, MULTIPART file + path):
  uploadFile(file: File, path: any) {
    const formData = new FormData();
    formData.append('file', file);//Nombre debe coincidir con @RequestParam("file").
    formData.append('path', path);//Nombre debe coincidir con @RequestParam("path").

    return this.http.post<ResponseSubirArchivoDTO>(`${this.baseUrl}/files/archivos`, formData);
  }

  //MOVER ARCHIVO (PUT /files/archivos/mover, BODY { sourcePath, destinationPath }):
  moveFile(moverArchivos: MoverArchivosI) {
     return this.http.put<ResponseMoverArchivoDTO>(`${this.baseUrl}/files/archivos/mover`, moverArchivos);
  }

  //RENOMBRAR ARCHIVO (PUT /files/archivos, BODY { oldPath, newPath } — AMBAS RUTAS COMPLETAS):
  renameFile(renombrarArchivos: RenombrarArchivosI) {
     return this.http.put<ResponseRenombrarArchivoDTO>(`${this.baseUrl}/files/archivos`, renombrarArchivos);
  }

  //ELIMINAR ARCHIVO (DELETE /files/archivos, BODY { filePath }):
  deleteFile(eliminarArchivos: EliminarArchivosI) {
     return this.http.request<ResponseEliminarArchivoDTO>('DELETE', `${this.baseUrl}/files/archivos`, {
       body: eliminarArchivos
     });
  }

}
