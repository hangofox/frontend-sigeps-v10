import { EmpleadosI } from '../empleados/empleados.interface';
import { TipoNovedadEmpleadoI } from '../tipos-novedades-empleados/tipos-novedades-empleados.interface';

export interface HistorialNovedadesEmpleadosI {
    idHistorialNovedadEmpleado?: number;
    fechaHMSHistorialNovedadEmpleado: String;
    descripcionHistorialNovedadEmpleado: String;
    empleadoDTO: EmpleadosI;
    tipoNovedadEmpleadoDTO: TipoNovedadEmpleadoI;
}
