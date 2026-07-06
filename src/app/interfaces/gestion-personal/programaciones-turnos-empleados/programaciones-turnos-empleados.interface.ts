import { EmpleadosI } from '../empleados/empleados.interface';
import { PuestoSedeEstablecimientoClienteI } from '../../panel-control/gestion-establecimientos-clientes/sedes-establecimientos-clientes/puestos-sedes-establec-clientes/puestos-sedes-establec-cliente.interface';
import { TurnosI } from '../../panel-control/turnos/turnos.interface';

export interface ProgramacionTurnoEmpleadoI {
    idProgramacionTurnoEmpleado?: number;
    fechaHMSIniciacionProgramacionTurnoEmpleado: String;
    fechaHMSFinalizacionProgramacionTurnoEmpleado: String;
    estadoProgramacionTurnoEmpleado: String;
    empleadoDTO: EmpleadosI;
    puestoSedeEstablecimientoClienteDTO: PuestoSedeEstablecimientoClienteI;
    turnoDTO: TurnosI;
}

export interface ProgramacionTurnoEmpleadoMsj {
    mensaje: string;
}
