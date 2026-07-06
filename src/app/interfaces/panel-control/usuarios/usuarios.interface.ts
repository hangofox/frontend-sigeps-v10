import { TiposDocumentosIdentificacionI } from "../../tipos-documentos-identificacion/tipos-documentos-identificacion.interface";
import { TiposUsuariosI } from "../tipos-usuarios/tipos-usuarios.interface";

export interface UsuariosI {
    idUsuario?: number;
    nicknameUsuario: String;
    passwordUsuario: String;
    tipoDocumentoIdentificacionDTO: TiposDocumentosIdentificacionI;
    numeroDocumentoIdentificacionUsuario: String;
    lugarExpedicionDocumentoIdentificacionUsuario: String;
    nombresUsuario: String;
    primerApellidoUsuario: String;
    segundoApellidoUsuario: String;
    nombreArchivoFotoExtensionoFormatoUsuario: String;
    fechaHMSNacimientoUsuario: String;
    sexoUsuario: String;
    direccionUsuario: String;
    telefonoUsuario: String;
    movilUsuario: String;
    correoElectronicoPersonalUsuario: String;
    correoElectronicoInstitucionalUsuario: String;
    paisOrigenUsuario: String;
    departamentooEstadoOrigenUsuario: String;
    ciudadOrigenUsuario: String;
    tipoUsuarioDTO: TiposUsuariosI;
    fechaHMSIngresoUsuario: String;
    fechaHMSModificacionUsuario: String;
    estadoUsuario: String;
}

export interface UsuariosMsj {
  mensaje: string;
}
