import { EmpleadosI } from '../empleados.interface';

export interface AltasEmpleadosI {
    idAltaEmpleado?: number;
    fechaHMSAltaEmpleado: String;
    numeroContratoOActoAdmvoNombEmpleado: String;
    empleadoDTO: EmpleadosI;
}

export interface AltasEmpleadosMsj {
    mensaje: string;
}
