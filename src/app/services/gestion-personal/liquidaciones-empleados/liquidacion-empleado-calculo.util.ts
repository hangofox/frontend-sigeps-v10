import { ProgramacionTurnoEmpleadoI } from '../../../interfaces/gestion-personal/programaciones-turnos-empleados/programaciones-turnos-empleados.interface';
import { TurnosI } from '../../../interfaces/panel-control/turnos/turnos.interface';
import { HistorialMovimientosEmpleadosI } from '../../../interfaces/gestion-personal/historial-movimientos-empleados/historialMovimientosEmpleados.interface';

//FUNCIONES PURAS COMPARTIDAS PARA CLASIFICAR LAS HORAS TRABAJADAS DE UN EMPLEADO EN LOS TIPOS DE TARIFA
//(ORDINARIA/EXTRA, DIURNA/NOCTURNA, DOMINICAL) A PARTIR DE SUS PROGRAMACIONES DE TURNO Y SU HISTORIAL DE
//MOVIMIENTOS REALES. EXTRAÍDO DE liquidacion-empleados.component.ts PARA QUE EL DASHBOARD DE INICIO PUEDA
//CALCULAR LA LIQUIDACIÓN DEL AÑO EN CURSO DE UN SOLO EMPLEADO CON LA MISMA LÓGICA EXACTA QUE USA EL LISTADO
//COMPLETO DE LIQUIDACIONES, SIN DUPLICARLA:

export interface VentanaDiurnaI {
  horaInicio: number;
  horaFin: number;
}

//BUSCA ENTRE LAS PROGRAMACIONES CARGADAS UN TURNO "DIURNO" DE MENOS DE 24 HORAS Y USA SU PROPIO HORARIO
//(hmsiniciacionTurno/hmsfinalizacionTurno DE tabla_turnos) COMO VENTANA DIURNA PARA TODA LA CLASIFICACIÓN — ASÍ
//LA VENTANA SALE DE LOS DATOS REALES DEL NEGOCIO EN VEZ DE UN VALOR FIJO EN EL CÓDIGO. SOLO SI NO HAY NINGÚN
//TURNO DIURNO CARGADO SE USA COMO ÚLTIMO RECURSO EL HORARIO DIURNO VIGENTE EN LA LEY LABORAL COLOMBIANA
//(06:00–19:00), Y ÚNICAMENTE PARA PODER PARTIR LOS TURNOS DE 24 HORAS QUE ABARCAN DÍA Y NOCHE:
export function determinarVentanaDiurnaDesdeCatalogo(programacionesCompleto: ProgramacionTurnoEmpleadoI[]): VentanaDiurnaI {
  const turnoDiurnoReferencia = programacionesCompleto
    .map(programacion => programacion.turnoDTO)
    .find(turno => turno && String(turno.nombreTurno || '').toUpperCase().includes('DIURNO') && duracionNominalTurnoEnHoras(turno) < 24);

  if (turnoDiurnoReferencia) {
    return {
      horaInicio: horaDecimal(String(turnoDiurnoReferencia.hmsiniciacionTurno)),
      horaFin: horaDecimal(String(turnoDiurnoReferencia.hmsfinalizacionTurno))
    };
  }

  return { horaInicio: 6, horaFin: 19 };
}

//CALCULA LA DURACIÓN NOMINAL (PROGRAMADA) DE UN TURNO EN HORAS A PARTIR DE SU PROPIO HORARIO DE tabla_turnos,
//MANEJANDO TURNOS QUE CRUZAN MEDIANOCHE (HORA FIN < HORA INICIO) Y TURNOS DE 24 HORAS (HORA INICIO = HORA FIN):
export function duracionNominalTurnoEnHoras(turno: TurnosI | undefined): number {
  if (!turno) return 0;
  const horaInicio = horaDecimal(String(turno.hmsiniciacionTurno));
  const horaFin = horaDecimal(String(turno.hmsfinalizacionTurno));
  if (horaFin === horaInicio) return 24;
  return horaFin > horaInicio ? (horaFin - horaInicio) : (24 - horaInicio + horaFin);
}

//CONVIERTE UN TEXTO "HH:mm:ss" DE tabla_turnos A UN NÚMERO DECIMAL DE HORAS (EJ. "18:30:00" → 18.5):
export function horaDecimal(horaTexto: string): number {
  const partes = horaTexto.split(':').map(Number);
  const horas = partes[0] || 0;
  const minutos = partes[1] || 0;
  const segundos = partes[2] || 0;
  return horas + minutos / 60 + segundos / 3600;
}

//CONSTRUYE UNA FECHA EN EL MISMO DÍA CALENDARIO DE referencia A LA HORA DECIMAL INDICADA:
export function horaDelDia(referencia: Date, horaDecimalValor: number): Date {
  const horas = Math.floor(horaDecimalValor);
  const minutos = Math.round((horaDecimalValor - horas) * 60);
  return new Date(referencia.getFullYear(), referencia.getMonth(), referencia.getDate(), horas, minutos, 0, 0);
}

//TRADUCE LA COMBINACIÓN DOMINICAL/DIURNA/EXTRA AL NOMBRE EXACTO DEL TIPO DE TARIFA REGISTRADO EN
//tabla_tipos_tarifas_empleados (LOS TIPOS FESTIVOS NO SE GENERAN AÚN, YA QUE EL SISTEMA NO TIENE UN CATÁLOGO DE
//DÍAS FESTIVOS COLOMBIANOS: SOLO SE CLASIFICA DOMINICAL POR DÍA DE LA SEMANA):
export function nombreTipoTarifa(esDominical: boolean, esDiurna: boolean, esExtra: boolean): string {
  const momentoDelDia = esDiurna ? 'DIURNA' : 'NOCTURNA';
  if (esDominical) {
    return esExtra ? `HORA EXTRA DOMINICAL ${momentoDelDia}` : `HORA DOMINICAL ${momentoDelDia}`;
  }
  return esExtra ? `HORA EXTRA ${momentoDelDia}` : `HORA ORDINARIA ${momentoDelDia}`;
}

//SUMA HORAS A UN TIPO DE TARIFA DENTRO DEL MAPA DE ACUMULACIÓN:
export function acumularHoras(horasPorTipo: Map<string, number>, nombreTipoTarifaEmpleado: string, horas: number): void {
  horasPorTipo.set(nombreTipoTarifaEmpleado, (horasPorTipo.get(nombreTipoTarifaEmpleado) || 0) + horas);
}

//DESCOMPONE UNA SOLA PROGRAMACIÓN DE TURNO (ENTRADA→SALIDA REAL, YA RECORTADA AL RANGO FILTRADO SI APLICA) EN
//TRAMOS QUE NO CRUCEN NI MEDIANOCHE NI EL LÍMITE DIURNA/NOCTURNA, Y ACUMULA CADA TRAMO EN EL TIPO DE TARIFA QUE
//LE CORRESPONDE, RESPETANDO EL UMBRAL DE HORAS ORDINARIAS PROPIO DE ESE TURNO (horasOrdinariasDelTurno).
//horasYaAcumuladasEnTurno PERMITE ARRANCAR EL CONTADOR DESDE UN PUNTO DISTINTO DE CERO CUANDO entrada NO ES EL
//VERDADERO INICIO DEL TURNO SINO UN RECORTE A MITAD DE TURNO (PARA NO "REINICIAR" EL UMBRAL ORDINARIA/EXTRA):
export function clasificarTurno(entrada: Date, salida: Date, horasOrdinariasDelTurno: number, ventanaDiurna: VentanaDiurnaI, horasPorTipo: Map<string, number>, horasYaAcumuladasEnTurno: number = 0): void {
  let cursor = entrada;
  let horasAcumuladasEnTurno = horasYaAcumuladasEnTurno;

  while (cursor.getTime() < salida.getTime()) {
    const inicioJornadaDiurna = horaDelDia(cursor, ventanaDiurna.horaInicio);
    const finJornadaDiurna = horaDelDia(cursor, ventanaDiurna.horaFin);
    const inicioDiaSiguiente = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1, 0, 0, 0, 0);

    const esDiurna = cursor.getTime() >= inicioJornadaDiurna.getTime() && cursor.getTime() < finJornadaDiurna.getTime();
    const finDelTramoActual = esDiurna
      ? finJornadaDiurna
      : (cursor.getTime() < inicioJornadaDiurna.getTime() ? inicioJornadaDiurna : inicioDiaSiguiente);

    const finTramo = new Date(Math.min(salida.getTime(), finDelTramoActual.getTime()));
    const horasTramo = (finTramo.getTime() - cursor.getTime()) / (1000 * 60 * 60);
    const esDominical = cursor.getDay() === 0;

    //DENTRO DEL TRAMO, LO QUE QUEDE DISPONIBLE DE LAS HORAS ORDINARIAS PROPIAS DE ESTE TURNO SE CLASIFICA
    //COMO ORDINARIO/DOMINICAL, Y EL RESTO (SI EL TURNO REAL SE EXTENDIÓ MÁS ALLÁ DE SU DURACIÓN NOMINAL) COMO EXTRA:
    const horasOrdinariasDisponibles = Math.max(0, horasOrdinariasDelTurno - horasAcumuladasEnTurno);
    const horasOrdinariasEnTramo = Math.min(horasTramo, horasOrdinariasDisponibles);
    const horasExtraEnTramo = horasTramo - horasOrdinariasEnTramo;

    if (horasOrdinariasEnTramo > 0) {
      acumularHoras(horasPorTipo, nombreTipoTarifa(esDominical, esDiurna, false), horasOrdinariasEnTramo);
    }
    if (horasExtraEnTramo > 0) {
      acumularHoras(horasPorTipo, nombreTipoTarifa(esDominical, esDiurna, true), horasExtraEnTramo);
    }

    horasAcumuladasEnTurno += horasTramo;
    cursor = finTramo;
  }
}

//BUSCA EN EL HISTORIAL DE MOVIMIENTOS LOS PONCHES REALES DE ENTRADA Y SALIDA LIGADOS A ESTA PROGRAMACIÓN DE
//TURNO (id_programacion_turno_empleado). ESTAS HORAS SON LAS QUE REALMENTE SE LIQUIDAN, YA QUE PUEDEN DIFERIR
//POR UNOS MINUTOS DEL HORARIO PROGRAMADO. SI LA PROGRAMACIÓN NO TIENE PONCHES EN EL HISTORIAL (POR EJEMPLO, UN
//DATO INCOMPLETO), SE USA COMO RESPALDO EL HORARIO PROGRAMADO DE LA PROPIA PROGRAMACIÓN DE TURNO:
export function obtenerIntervaloRealDeProgramacion(programacion: ProgramacionTurnoEmpleadoI, historialMovimientosCompleto: HistorialMovimientosEmpleadosI[]): { inicio: Date; fin: Date } | null {
  const movimientosDeLaProgramacion = historialMovimientosCompleto
    .filter(movimiento => movimiento.programacionTurnoEmpleadoDTO?.idProgramacionTurnoEmpleado === programacion.idProgramacionTurnoEmpleado)
    .map(movimiento => ({
      fecha: new Date(String(movimiento.fechaHMSHistorialMovimientoEmpleado).replace(' ', 'T')),
      nombreTipoMovimiento: String(movimiento.tipoMovimientoDTO?.nombreTipoMovimiento || '').toUpperCase()
    }))
    .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

  const entrada = movimientosDeLaProgramacion.find(movimiento => movimiento.nombreTipoMovimiento === 'ENTRADA');
  const salida = [...movimientosDeLaProgramacion].reverse().find(movimiento => movimiento.nombreTipoMovimiento === 'SALIDA');

  if (entrada && salida && salida.fecha.getTime() > entrada.fecha.getTime()) {
    return { inicio: entrada.fecha, fin: salida.fecha };
  }

  const inicioProgramado = new Date(String(programacion.fechaHMSIniciacionProgramacionTurnoEmpleado).replace(' ', 'T'));
  const finProgramado = new Date(String(programacion.fechaHMSFinalizacionProgramacionTurnoEmpleado).replace(' ', 'T'));
  return finProgramado.getTime() > inicioProgramado.getTime() ? { inicio: inicioProgramado, fin: finProgramado } : null;
}

//TOMA LAS PROGRAMACIONES DE TURNO YA FINALIZADAS DEL EMPLEADO EN EL AÑO INDICADO (LAS "ACTIVO" AÚN NO
//TERMINARON Y NO SE LIQUIDAN) Y, POR CADA UNA, BUSCA SU ENTRADA/SALIDA REAL EN EL HISTORIAL DE MOVIMIENTOS
//(EL PONCHE REAL, QUE PUEDE DIFERIR DE LO PROGRAMADO), LA RECORTA AL RANGO fechaInicioFiltro/fechaFinFiltro SI
//SE INDICÓ, Y DESCOMPONE ESE RANGO EN TRAMOS DIURNOS/NOCTURNOS, CLASIFICÁNDOLOS EN ORDINARIO O EXTRA SEGÚN LA
//DURACIÓN NOMINAL DEL turnoDTO ASIGNADO (8, 12 O 24 HORAS SEGÚN EL TURNO — NO UN NÚMERO FIJO), Y EN DOMINICAL SI
//CAEN EN DOMINGO. DEVUELVE UN MAPA nombreTipoTarifaEmpleado → HORAS ACUMULADAS EN ESE TIPO DURANTE TODO EL AÑO:
export function clasificarHorasTrabajadasPorEmpleado(
  idEmpleado: number,
  anioTarifaEmpleado: number,
  ventanaDiurna: VentanaDiurnaI,
  programacionesCompleto: ProgramacionTurnoEmpleadoI[],
  historialMovimientosCompleto: HistorialMovimientosEmpleadosI[],
  fechaInicioFiltro?: Date,
  fechaFinFiltro?: Date
): Map<string, number> {
  const horasPorTipo = new Map<string, number>();

  const programacionesDelEmpleado = programacionesCompleto.filter(programacion =>
    programacion.empleadoDTO?.idEmpleado === idEmpleado &&
    String(programacion.estadoProgramacionTurnoEmpleado || '').toUpperCase() === 'FINALIZADO'
  );

  for (const programacion of programacionesDelEmpleado) {
    const intervaloReal = obtenerIntervaloRealDeProgramacion(programacion, historialMovimientosCompleto);
    if (!intervaloReal) continue;

    //RECORTA EL TURNO REAL AL RANGO FILTRADO (SI SE INDICÓ ALGÚN EXTREMO); SI EL TURNO QUEDA TOTALMENTE FUERA
    //DEL RANGO, SE DESCARTA:
    const inicioRecortado = fechaInicioFiltro && fechaInicioFiltro.getTime() > intervaloReal.inicio.getTime() ? fechaInicioFiltro : intervaloReal.inicio;
    const finRecortado = fechaFinFiltro && fechaFinFiltro.getTime() < intervaloReal.fin.getTime() ? fechaFinFiltro : intervaloReal.fin;
    if (finRecortado.getTime() <= inicioRecortado.getTime() || inicioRecortado.getFullYear() !== anioTarifaEmpleado) continue;

    //HORAS DEL TURNO YA TRANSCURRIDAS ANTES DEL PUNTO DE RECORTE, PARA QUE EL UMBRAL ORDINARIA/EXTRA SIGA
    //CONTANDO DESDE EL INICIO REAL DEL TURNO Y NO SE "REINICIE" AL RECORTAR A MITAD DE TURNO:
    const horasYaAcumuladasAntesDelRecorte = (inicioRecortado.getTime() - intervaloReal.inicio.getTime()) / (1000 * 60 * 60);

    const horasOrdinariasDelTurno = duracionNominalTurnoEnHoras(programacion.turnoDTO);
    clasificarTurno(inicioRecortado, finRecortado, horasOrdinariasDelTurno, ventanaDiurna, horasPorTipo, horasYaAcumuladasAntesDelRecorte);
  }

  return horasPorTipo;
}
