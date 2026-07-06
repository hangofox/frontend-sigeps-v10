import { EmpleadosI } from '../empleados/empleados.interface';
import { TipoMovimientoI } from '../tipos-movimientos-empleados/tipos-movimientos-empleados.interface';
import { ProgramacionTurnoEmpleadoI } from '../programaciones-turnos-empleados/programaciones-turnos-empleados.interface';

export interface HistorialMovimientosEmpleadosI {
    idHistorialMovimientoEmpleado?: number;
    fechaHMSHistorialMovimientoEmpleado: String;
    empleadoDTO: EmpleadosI;
    programacionTurnoEmpleadoDTO: ProgramacionTurnoEmpleadoI;
    tipoMovimientoDTO: TipoMovimientoI;
}
