import { ClasificacionEmpleadoPlantaI } from '../clasificaciones-empleados-planta.interface';

export interface SubclasificacionEmpleadoPlantaI {
    idSubclasificacionEmpleadoPlanta?: number;
    nombreSubclasificacionEmpleadoPlanta: String;
    clasificacionEmpleadoPlantaDTO: ClasificacionEmpleadoPlantaI;
}

export interface SubclasificacionEmpleadoPlantaMsj {
    mensaje: string;
}
