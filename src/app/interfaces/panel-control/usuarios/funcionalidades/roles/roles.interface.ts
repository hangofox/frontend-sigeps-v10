import { FuncionalidadesI } from "../../funcionalidades/funcionalidades.interface";

export interface RolesI {
    idRol?: number;
    nombreRol: String;
    funcionalidadDTO: FuncionalidadesI;
    //label: String;//SE REQUIERE PARA VISUALIZAR LOS DATOS CON EL DROPDOWN DE PRIMENG.
}

export interface RolesMsj {
    mensaje: string;
}