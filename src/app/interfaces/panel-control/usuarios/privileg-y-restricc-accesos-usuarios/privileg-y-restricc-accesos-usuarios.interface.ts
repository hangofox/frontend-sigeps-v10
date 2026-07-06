import { UsuariosI } from "../../usuarios/usuarios.interface";
import { FuncionalidadesI } from "../funcionalidades/funcionalidades.interface";
import { RolesI } from "../funcionalidades/roles/roles.interface";

export interface PrivilegyRestriccAccesosUsuariosI {
    idPrivilegyRestriccAccesoUsuario?: number;
    numRegPrivilegyRestriccAccesoUsuario?: String;
    usuarioDTO: UsuariosI;
    funcionalidadDTO: FuncionalidadesI;
    rolDTO: RolesI;
    urlAccesoUsuario: String;
    sioNoPrivilegyRestriccAccesoUsuario: String;
    fechaHMSIngresoPrivilegyRestriccAccesoUsuario: String;
    //label: String;//SE REQUIERE PARA VISUALIZAR LOS DATOS CON EL DROPDOWN DE PRIMENG.
}

export interface PrivilegyRestriccAccesosUsuariosMsj {
    mensaje: string;
}