import { TiposDocumentosIdentificacionI } from '../../tipos-documentos-identificacion/tipos-documentos-identificacion.interface';
import { TipoEmpleadoI } from '../tipos-empleados/tipos-empleados.interface';
import { TipoEmpleadoPlantaI } from '../tipos-empleados-planta/tipos-empleados-planta.interface';
import { ClasificacionEmpleadoPlantaI } from '../clasificaciones-empleados-planta/clasificaciones-empleados-planta.interface';
import { SubclasificacionEmpleadoPlantaI } from '../clasificaciones-empleados-planta/subclasificaciones-empleados-planta/subclasificaciones-empleados-planta.interface';

export interface EmpleadosI {
    idEmpleado?: number;
    numeroDocumentoIdentificacionEmpleado: String;
    nombresEmpleado: String;
    primerApellidoEmpleado: String;
    segundoApellidoEmpleado: String;
    nombreArchivoFotoExtensionOFormatoEmpleado: String;
    direccionEmpleado: String;
    telefonoEmpleado: String;
    movilEmpleado: String;
    correoElectronicoPersonalEmpleado: String;
    correoElectronicoInstitucionalEmpleado: String;
    paisOrigenEmpleado: String;
    departamentooEstadoOrigenEmpleado: String;
    ciudadOrigenEmpleado: String;
    fechaHMSIngresoEmpleado: String;
    fechaHMSModificacionEmpleado: String;
    estadoEmpleado: String;
    tipoDocumentoIdentificacionDTO: TiposDocumentosIdentificacionI;
    tipoEmpleadoDTO: TipoEmpleadoI;
    tipoEmpleadoPlantaDTO: TipoEmpleadoPlantaI;
    clasificacionEmpleadoPlantaDTO: ClasificacionEmpleadoPlantaI;
    subclasificacionEmpleadoPlantaDTO: SubclasificacionEmpleadoPlantaI;
}

export interface EmpleadosMsj {
    mensaje: string;
}
