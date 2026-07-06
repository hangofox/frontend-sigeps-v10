import { UsuariosI } from "./usuarios.interface";

export interface ResponseUsuarioDTO{
    usuarioDTO: UsuariosI;
    mensaje: string;
}