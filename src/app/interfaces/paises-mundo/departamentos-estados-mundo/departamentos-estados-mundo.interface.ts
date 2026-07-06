import { PaisesMundoI } from "../paises-mundo.interface";

export interface DepartamentosoEstadosMundoI {
    idDepartamentooEstadoMundo?: number;
    nombreDepartamentooEstadoMundo: String;
    paisMundoDTO: PaisesMundoI;
}

export interface DepartamentosoEstadosMundoMsj {
    mensaje: string;
}
