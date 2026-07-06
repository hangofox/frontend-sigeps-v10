import { LiquidacionesEmpleadosI } from "./liquidacionesEmpleados.interface";

export interface ResponseLiquidacionEmpleadoDTO {
    bajaEmpleadoDTO: LiquidacionesEmpleadosI;
    mensaje: string;
}
