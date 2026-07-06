//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

//IMPORTACIÓN DE INTERFACES:
import { EmpleadosI } from '../../interfaces/gestion-personal/empleados/empleados.interface';
import { PuestoSedeEstablecimientoClienteI } from '../../interfaces/panel-control/gestion-establecimientos-clientes/sedes-establecimientos-clientes/puestos-sedes-establec-clientes/puestos-sedes-establec-cliente.interface';
import { ProgramacionTurnoEmpleadoI } from '../../interfaces/gestion-personal/programaciones-turnos-empleados/programaciones-turnos-empleados.interface';
import { HistorialMovimientosEmpleadosI } from '../../interfaces/gestion-personal/historial-movimientos-empleados/historialMovimientosEmpleados.interface';

//IMPORTACIÓN DE SERVICIOS:
import { EmpleadosService } from '../gestion-personal/empleados/empleados.service';
import { PuestosSedesEstablecimientosClientesService } from '../panel-control/gestion-establecimientos-clientes/sedes-establecimientos-clientes/puestos-sedes-establec-cliente/puestosSedesEstablecimientosClientes.service';
import { ProgramacionesTurnosEmpleadosService } from '../gestion-personal/programaciones-turnos-empleados/programacionesTurnosEmpleados.service';
import { HistorialMovimientosEmpleadosService } from '../gestion-personal/historial-movimientos-empleados/historialMovimientosEmpleados.service';

//RESULTADO DE LAS 5 ALERTAS DE SEGURIDAD CALCULADAS. LO CONSUME TANTO ReportesSeguridadComponent (DETALLE)
//COMO InicioComponent (SOLO EL TOTAL EN LA TARJETA DEL DASHBOARD) PARA QUE AMBOS SIEMPRE COINCIDAN:
export interface AlertasSeguridadResultado {
  alertaPuestosSinCobertura: PuestoSedeEstablecimientoClienteI[];
  alertaPersonalInactivoConTurno: ProgramacionTurnoEmpleadoI[];
  alertaTurnosVencidosSinSalida: HistorialMovimientosEmpleadosI[];
  alertaInasistencias: ProgramacionTurnoEmpleadoI[];
  alertaUbicacionInactivaConTurno: ProgramacionTurnoEmpleadoI[];
}

@Injectable({
  providedIn: 'root'
})
export class AlertasSeguridadService {

  //CONSTRUCTOR DEL SERVICIO:
  constructor(
    private empleadosService: EmpleadosService,
    private puestosSedesEstablecimientosClientesService: PuestosSedesEstablecimientosClientesService,
    private programacionesTurnosEmpleadosService: ProgramacionesTurnosEmpleadosService,
    private historialMovimientosEmpleadosService: HistorialMovimientosEmpleadosService
  ) {}

  //MÉTODO ÚNICO Y REUTILIZABLE: TRAE LOS 4 LISTADOS COMPLETOS NECESARIOS PARA CRUZAR INFORMACIÓN Y DEVUELVE
  //LAS 5 ALERTAS YA CALCULADAS. CUALQUIER COMPONENTE QUE NECESITE ESTAS ALERTAS (Inicio, Reportes de Seguridad)
  //DEBE LLAMAR A ESTE MÉTODO EN VEZ DE DUPLICAR LA LÓGICA, PARA QUE EL TOTAL SIEMPRE COINCIDA EN TODA LA APP:
  getSecurityAlerts(): Observable<AlertasSeguridadResultado> {
    return forkJoin({
      empleados: this.empleadosService.findAllEmployees(),
      puestos: this.puestosSedesEstablecimientosClientesService.findAllClientEstablishmentBranchPosts(),
      programaciones: this.programacionesTurnosEmpleadosService.findAllEmployeeShiftSchedules(),
      historial: this.historialMovimientosEmpleadosService.findAllEmployeeMovementHistories()
    }).pipe(
      map(({ empleados, puestos, programaciones, historial }) =>
        this.calcularAlertas(empleados, puestos, programaciones, historial)
      )
    );
  }

  //CONVIERTE LOS "fechaHMS..." DEL BACKEND (STRING "yyyy-MM-dd HH:mm:ss") A Date:
  private aFecha(valor: String | undefined): Date | null {
    if (!valor) return null;
    const fecha = new Date(String(valor).replace(' ', 'T'));
    return isNaN(fecha.getTime()) ? null : fecha;
  }

  //CALCULA LAS 5 ALERTAS DE SEGURIDAD A PARTIR DE LOS 4 LISTADOS COMPLETOS, CRUZANDO LA INFORMACIÓN ENTRE ELLOS
  //(MISMA LÓGICA QUE YA USABA ReportesSeguridadComponent, MOVIDA AQUÍ PARA QUE SEA COMPARTIDA):
  private calcularAlertas(
    empleadosCompleto: EmpleadosI[],
    puestosCompleto: PuestoSedeEstablecimientoClienteI[],
    programacionesCompleto: ProgramacionTurnoEmpleadoI[],
    historialCompleto: HistorialMovimientosEmpleadosI[]
  ): AlertasSeguridadResultado {
    const ahora = new Date();

    //ÚLTIMO MOVIMIENTO POR EMPLEADO (MISMA LÓGICA QUE listado-empleados.component.ts):
    const ultimoMovimientoPorEmpleado = new Map<number, HistorialMovimientosEmpleadosI>();
    historialCompleto.forEach(movimiento => {
      const idEmpleado = movimiento.empleadoDTO?.idEmpleado;
      if (idEmpleado === undefined) return;
      const actual = ultimoMovimientoPorEmpleado.get(idEmpleado);
      const fechaMovimiento = this.aFecha(movimiento.fechaHMSHistorialMovimientoEmpleado);
      const fechaActual = actual ? this.aFecha(actual.fechaHMSHistorialMovimientoEmpleado) : null;
      if (!actual || (fechaMovimiento && fechaActual && fechaMovimiento > fechaActual)) {
        ultimoMovimientoPorEmpleado.set(idEmpleado, movimiento);
      }
    });

    //MOVIMIENTOS DE ENTRADA (EMPLEADOS ACTUALMENTE "EN TURNO") SEGÚN SU ÚLTIMO MOVIMIENTO:
    const movimientosEnTurno = Array.from(ultimoMovimientoPorEmpleado.values())
      .filter(m => String(m.tipoMovimientoDTO?.nombreTipoMovimiento || '').toUpperCase() === 'ENTRADA');

    //1° ALERTA — PUESTOS ACTIVOS SIN NINGÚN EMPLEADO EN TURNO ASIGNADO EN ESTE MOMENTO:
    const idsPuestosCubiertos = new Set<number>(
      movimientosEnTurno
        .map(m => m.programacionTurnoEmpleadoDTO?.puestoSedeEstablecimientoClienteDTO?.idPuestoSedeEstablecimientoCliente)
        .filter((id): id is number => id !== undefined)
    );
    const alertaPuestosSinCobertura = puestosCompleto.filter(p =>
      p.estadoPuestoSedeEstablecimientoCliente === 'ACTIVO' &&
      p.idPuestoSedeEstablecimientoCliente !== undefined &&
      !idsPuestosCubiertos.has(p.idPuestoSedeEstablecimientoCliente)
    );

    //2° ALERTA — PERSONAL INACTIVO QUE AÚN TIENE UNA PROGRAMACIÓN DE TURNO VIGENTE (ACTIVA) ASIGNADA:
    const alertaPersonalInactivoConTurno = programacionesCompleto.filter(p =>
      p.estadoProgramacionTurnoEmpleado === 'ACTIVO' &&
      p.empleadoDTO?.estadoEmpleado === 'INACTIVO'
    );

    //3° ALERTA — EMPLEADOS "EN TURNO" CUYA PROGRAMACIÓN YA SUPERÓ SU FECHA/HORA DE FINALIZACIÓN Y NO HAN MARCADO SALIDA:
    const alertaTurnosVencidosSinSalida = movimientosEnTurno.filter(m => {
      const fechaFin = this.aFecha(m.programacionTurnoEmpleadoDTO?.fechaHMSFinalizacionProgramacionTurnoEmpleado);
      return fechaFin !== null && fechaFin < ahora;
    });

    //4° ALERTA — INASISTENCIAS: PROGRAMACIONES ACTIVAS YA INICIADAS SIN NINGÚN REGISTRO DE ENTRADA EN EL HISTORIAL:
    const idsProgramacionesConEntrada = new Set<number>(
      historialCompleto
        .filter(m => String(m.tipoMovimientoDTO?.nombreTipoMovimiento || '').toUpperCase() === 'ENTRADA')
        .map(m => m.programacionTurnoEmpleadoDTO?.idProgramacionTurnoEmpleado)
        .filter((id): id is number => id !== undefined)
    );
    const alertaInasistencias = programacionesCompleto.filter(p => {
      const fechaInicio = this.aFecha(p.fechaHMSIniciacionProgramacionTurnoEmpleado);
      return p.estadoProgramacionTurnoEmpleado === 'ACTIVO' &&
        fechaInicio !== null && fechaInicio < ahora &&
        p.idProgramacionTurnoEmpleado !== undefined &&
        !idsProgramacionesConEntrada.has(p.idProgramacionTurnoEmpleado);
    });

    //5° ALERTA — PROGRAMACIONES DE TURNO VIGENTES ASIGNADAS A UN PUESTO, SEDE O ESTABLECIMIENTO CLIENTE INACTIVO:
    const alertaUbicacionInactivaConTurno = programacionesCompleto.filter(p => {
      if (p.estadoProgramacionTurnoEmpleado !== 'ACTIVO') return false;
      const puesto = p.puestoSedeEstablecimientoClienteDTO;
      const sede = puesto?.sedeEstablecimientoClienteDTO;
      const establecimiento = sede?.establecimientoClienteDTO;
      return puesto?.estadoPuestoSedeEstablecimientoCliente === 'INACTIVO' ||
        sede?.estadoSedeEstablecimientoCliente === 'INACTIVO' ||
        establecimiento?.estadoEstablecimientoCliente === 'INACTIVO';
    });

    return {
      alertaPuestosSinCobertura,
      alertaPersonalInactivoConTurno,
      alertaTurnosVencidosSinSalida,
      alertaInasistencias,
      alertaUbicacionInactivaConTurno
    };
  }
}
