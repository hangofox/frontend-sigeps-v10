import { EmpleadosI } from '../empleados.interface';

export interface LiquidacionesEmpleadosI {
    idBajaEmpleado?: number;
    fechaHMSBajaEmpleado: String;
    numeroContratoOActoAdmvoNombEmpleado: String;
    empleadoDTO: EmpleadosI;
}

export interface LiquidacionesEmpleadosMsj {
    mensaje: string;
}
