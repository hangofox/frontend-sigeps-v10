import { PaisesMundoI } from '../../paises-mundo.interface';
import { DepartamentosoEstadosMundoI } from "../departamentos-estados-mundo.interface";

export interface CiudadesMundoI {
    idCiudadMundo?: number;
    nombreCiudadMundo: String;
    paisMundoDTO: PaisesMundoI;
    departamentooEstadoMundoDTO: DepartamentosoEstadosMundoI;
}

export interface CiudadesMundoMsj {
    mensaje: string;
}
