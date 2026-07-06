import { UsuariosI } from "../../usuarios/usuarios.interface";

export interface RecuperacionesContrasenasAccesosUsuariosI {
    idRecuperacionContrasenaAccesoUsuario?: number;
    usuarioDTO: UsuariosI;
    codigoActivacionContrasenaAccesoUsuario: String;
    fechaHMSExpCodActivContrasenaAccesoUsuario: String;
    estadoUsoCodigoActivacionContrasenaAccesoUsuario: String;
}

export interface RecuperacionesContrasenasAccesosUsuariosMsj {
    mensaje: string;
}