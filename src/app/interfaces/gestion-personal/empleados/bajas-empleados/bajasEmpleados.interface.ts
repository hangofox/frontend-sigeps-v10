import { EmpleadosI } from '../empleados.interface';

export interface BajasEmpleadosI {
    idBajaEmpleado?: number;
    fechaHMSBajaEmpleado: String;
    numeroContratoOActoAdmvoNombEmpleado: String;
    empleadoDTO: EmpleadosI;
}

export interface BajasEmpleadosMsj {
    mensaje: string;
}
