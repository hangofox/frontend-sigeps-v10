import { TiposDocumentosIdentificacionI } from '../../tipos-documentos-identificacion/tipos-documentos-identificacion.interface';

export interface EstablecimientoClienteI {
    idEstablecimientoCliente?: number;
    numeroDocumentoIdentificacionEstablecimientoCliente: String;
    nombreRazonSocialEstablecimientoCliente: String;
    fechaHMSIngresoEstablecimientoCliente: String;
    fechaHMSModificacionEstablecimientoCliente: String;
    estadoEstablecimientoCliente: String;
    tipoDocumentoIdentificacionDTO: TiposDocumentosIdentificacionI;
}

export interface EstablecimientoClienteMsj {
    mensaje: string;
}
