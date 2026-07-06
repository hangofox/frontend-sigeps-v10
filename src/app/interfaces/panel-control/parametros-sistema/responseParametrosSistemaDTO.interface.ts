import { ParametrosSistemaI } from "./parametros-sistema.interface";

export interface ResponseParametrosSistemaDTO{
    parametrosSistemaDTO: ParametrosSistemaI;
    mensaje: string;
}