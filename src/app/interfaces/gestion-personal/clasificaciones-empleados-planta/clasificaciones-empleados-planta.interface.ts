import { TipoEmpleadoPlantaI } from '../tipos-empleados-planta/tipos-empleados-planta.interface';

export interface ClasificacionEmpleadoPlantaI {
    idClasificacionEmpleadoPlanta?: number;
    nombreClasificacionEmpleadoPlanta: String;
    tipoEmpleadoPlantaDTO: TipoEmpleadoPlantaI;
}

export interface ClasificacionEmpleadoPlantaMsj {
    mensaje: string;
}
