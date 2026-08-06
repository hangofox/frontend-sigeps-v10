import { TipoEmpleadoI } from "../../tipos-empleados/tipos-empleados.interface";
import { TipoEmpleadoPlantaI } from "../../tipos-empleados-planta/tipos-empleados-planta.interface";
import { ClasificacionEmpleadoPlantaI } from "../../clasificaciones-empleados-planta/clasificaciones-empleados-planta.interface";
import { SubclasificacionEmpleadoPlantaI } from "../../clasificaciones-empleados-planta/subclasificaciones-empleados-planta/subclasificaciones-empleados-planta.interface";
import { TiposTarifasEmpleadosI } from "../tipos-tarifas-empleados/tipos-tarifas-empleados.interface";

export interface TarifasEmpleadosI {
    idTarifaEmpleado?: number;
    anioTarifaEmpleado: number;
    valorHoraTarifaEmpleado: number;
    fechaHMSIngresoTarifaEmpleado: String;
    fechaHMSModificacionTarifaEmpleado: String;
    estadoTarifaEmpleado: String;
    tipoEmpleadoDTO: TipoEmpleadoI;
    tipoEmpleadoPlantaDTO: TipoEmpleadoPlantaI;
    clasificacionEmpleadoPlantaDTO: ClasificacionEmpleadoPlantaI;
    subclasificacionEmpleadoPlantaDTO: SubclasificacionEmpleadoPlantaI;
    tipoTarifaEmpleadoDTO: TiposTarifasEmpleadosI;
}

export interface TarifasEmpleadosMsj {
    mensaje: string;
}
