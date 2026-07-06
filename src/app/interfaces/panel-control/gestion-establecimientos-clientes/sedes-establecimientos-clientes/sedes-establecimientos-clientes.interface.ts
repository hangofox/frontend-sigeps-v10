import { EstablecimientoClienteI } from '../establecimientos-clientes.interface';

export interface SedeEstablecimientoClienteI {
    idSedeEstablecimientoCliente?: number;
    nombreSedeEstablecimientoCliente: String;
    direccionSedeEstablecimientoCliente: String;
    telefonoSedeEstablecimientoCliente: String;
    movilSedeEstablecimientoCliente: String;
    correoElectronicoInstitucionalSedeEstablecimientoCliente: String;
    paisOrigenSedeEstablecimientoCliente: String;
    departamentooEstadoOrigenSedeEstablecimientoCliente: String;
    ciudadOrigenSedeEstablecimientoCliente: String;
    fechaHMSIngresoSedeEstablecimientoCliente: String;
    fechaHMSModificacionSedeEstablecimientoCliente: String;
    estadoSedeEstablecimientoCliente: String;
    establecimientoClienteDTO: EstablecimientoClienteI;
}

export interface SedeEstablecimientoClienteMsj {
    mensaje: string;
}
