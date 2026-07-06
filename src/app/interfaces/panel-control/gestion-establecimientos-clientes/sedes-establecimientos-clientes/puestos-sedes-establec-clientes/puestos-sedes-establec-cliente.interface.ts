import { SedeEstablecimientoClienteI } from '../sedes-establecimientos-clientes.interface';

export interface PuestoSedeEstablecimientoClienteI {
    idPuestoSedeEstablecimientoCliente?: number;
    nombrePuestoSedeEstablecimientoCliente: String;
    descripcionPuestoSedeEstablecimientoCliente: String;
    fechaHMSIngresoPuestoSedeEstablecimientoCliente: String;
    fechaHMSModificacionPuestoSedeEstablecimientoCliente: String;
    estadoPuestoSedeEstablecimientoCliente: String;
    sedeEstablecimientoClienteDTO: SedeEstablecimientoClienteI;
}

export interface PuestoSedeEstablecimientoClienteMsj {
    mensaje: string;
}
