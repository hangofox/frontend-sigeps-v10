export interface ArchivoSubidoI {
  nombreArchivo: string;
  rutaArchivo: string;
  tipoArchivo: string;
  tamanoArchivo: number;
}

export interface ResponseGestionArchivoI {
  mensaje: string;
  archivoSubido: ArchivoSubidoI;
}

export interface EliminarArchivoI {
  rutaArchivo: string;
}
