import { UsuariosI } from '../usuarios/usuarios.interface';

export interface AuditoriaSistemaI {
    idAuditoriaSistema?: number;
    fechaHMSAuditoriaSistema: String;
    accionUsuarioSistema: String;
    descripcionAuditoriaSistema: String;
    usuarioDTO: UsuariosI;
}

export interface AuditoriaSistemaMsj {
    mensaje: string;
}
