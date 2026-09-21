//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';

//IMPORTACIÓN DE INTERFACES:
import { TarifasEmpleadosI } from '../../../interfaces/panel-control/tarifas-empleados/tarifas-empleados.interface';
import { TiposTarifasEmpleadosI } from '../../../interfaces/panel-control/tipos-tarifas-empleados/tipos-tarifas-empleados.interface';
import { EmpleadosI } from '../../../interfaces/gestion-personal/empleados/empleados.interface';
import { ProgramacionTurnoEmpleadoI } from '../../../interfaces/gestion-personal/programaciones-turnos-empleados/programaciones-turnos-empleados.interface';
import { TurnosI } from '../../../interfaces/panel-control/turnos/turnos.interface';
import { HistorialMovimientosEmpleadosI } from '../../../interfaces/gestion-personal/historial-movimientos-empleados/historialMovimientosEmpleados.interface';

//IMPORTACIÓN DE SERVICIOS:
import { TarifasEmpleadosService } from '../../../services/panel-control/tarifas-empleados/tarifas-empleados.service';
import { TiposTarifasEmpleadosService } from '../../../services/panel-control/tipos-tarifas-empleados/tipos-tarifas-empleados.service';
import { EmpleadosService } from '../../../services/gestion-personal/empleados/empleados.service';
import { ProgramacionesTurnosEmpleadosService } from '../../../services/gestion-personal/programaciones-turnos-empleados/programacionesTurnosEmpleados.service';
import { HistorialMovimientosEmpleadosService } from '../../../services/gestion-personal/historial-movimientos-empleados/historialMovimientosEmpleados.service';

//AGRUPACIÓN DE UN EMPLEADO CON LA TARIFA DE SU PERFIL Y LAS HORAS QUE ESA TARIFA LLEGÓ A CUBRIR, PARA CALCULAR SU LIQUIDACIÓN:
interface LiquidacionCalculadaI {
  empleado: EmpleadosI;
  tarifa: TarifasEmpleadosI;
  horasTrabajadas: number;
  valorBruto: number;
}

//SUBTOTAL DE LIQUIDACIONES AGRUPADAS POR AÑO, PARA EL DESGLOSE DEBAJO DEL SEMÁFORO:
interface SubtotalPorAnioI {
  anio: number;
  totalRegistros: number;
  totalValorBruto: number;
  totalValorNeto: number;
}

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-liquidacion-empleados',
  templateUrl: './liquidacion-empleados.component.html',
  styleUrls: ['./liquidacion-empleados.component.scss']
})
export class LiquidacionEmpleadosComponent implements OnInit {

  //DECLARACIÓN DE VARIABLES GLOBALES:
  liquidacionesForm!: FormGroup;

  //SEMÁFORO DE TOTALES:
  totalRegistros: number = 0;
  totalValorBruto: number = 0;
  totalValorNeto: number = 0;

  //PAGINACIÓN (SE PAGINA EN EL CLIENTE PORQUE LOS TOTALES DEL SEMÁFORO SE CALCULAN SOBRE TODO EL LISTADO FILTRADO):
  paginaActual: number = 0;
  tandaNumeroRegistrosporPagina: number = 10;

  //PORCENTAJE DE DESCUENTOS DE LEY APLICADO SOBRE EL VALOR BRUTO DE LA LIQUIDACIÓN PARA OBTENER EL VALOR NETO:
  private readonly porcentajeDescuentoLiquidacion = 0.08;

  //NADA DE LO QUE CLASIFICA UNA HORA SE FIJA COMO CONSTANTE: LA DURACIÓN "ORDINARIA" DE CADA TURNO SALE DEL
  //PROPIO tabla_turnos DEL EMPLEADO (8, 12 O 24 HORAS SEGÚN EL TURNO ASIGNADO), Y LA VENTANA DIURNA/NOCTURNA SE
  //DERIVA EN CALIENTE DEL PRIMER TURNO "DIURNO" CARGADO (VER determinarVentanaDiurnaDesdeCatalogo). LO ÚNICO QUE
  //EL SISTEMA AÚN NO TIENE ES UN CATÁLOGO DE DÍAS FESTIVOS COLOMBIANOS, POR LO QUE LOS TIPOS "HORA FESTIVA ..." Y
  //"HORA EXTRA FESTIVA ..." NUNCA SE GENERAN TODAVÍA (SOLO SE CLASIFICA DOMINICAL POR DÍA DE LA SEMANA):

  //TIPOS DE TARIFA DE EMPLEADO — CARGADOS DESDE EL BACKEND (SE USAN COMO "TIPO DE LIQUIDACIÓN" EN EL COMBO DE FILTRO):
  tiposTarifasEmpleados: TiposTarifasEmpleadosI[] = [];

  //AÑOS DISTINTOS DE LAS TARIFAS DE EMPLEADOS REGISTRADAS EN EL BACKEND (PARA EL COMBO DE FILTRO POR AÑO):
  aniosTarifasEmpleados: number[] = [];

  //CATÁLOGOS COMPLETOS TRAÍDOS DEL BACKEND, BASE PARA CALCULAR LAS LIQUIDACIONES:
  private empleadosCompleto: EmpleadosI[] = [];
  private tarifasEmpleadosCompleto: TarifasEmpleadosI[] = [];
  private programacionesTurnosCompleto: ProgramacionTurnoEmpleadoI[] = [];
  private historialMovimientosCompleto: HistorialMovimientosEmpleadosI[] = [];

  //LIQUIDACIONES YA CALCULADAS Y FILTRADAS, SIN PAGINAR (BASE PARA CALCULAR LOS TOTALES REALES DEL SEMÁFORO):
  private liquidacionesFiltradas: LiquidacionCalculadaI[] = [];

  //LISTA DE LA PÁGINA ACTUAL A MOSTRAR EN LA TABLA:
  liquidaciones: LiquidacionCalculadaI[] = [];

  //DESGLOSE DE LOS TOTALES DEL SEMÁFORO POR AÑO, SOBRE EL MISMO LISTADO YA FILTRADO (PALABRA CLAVE, TIPO DE
  //TARIFA Y AÑO), ORDENADO DEL AÑO MÁS RECIENTE AL MÁS ANTIGUO:
  subtotalesPorAnio: SubtotalPorAnioI[] = [];

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private formBuilder: FormBuilder,
    private tarifasEmpleadosService: TarifasEmpleadosService,
    private tiposTarifasEmpleadosService: TiposTarifasEmpleadosService,
    private empleadosService: EmpleadosService,
    private programacionesTurnosEmpleadosService: ProgramacionesTurnosEmpleadosService,
    private historialMovimientosEmpleadosService: HistorialMovimientosEmpleadosService
  ) {}

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    this.initForm();
    this.cargarTiposTarifasEmpleados();
    this.cargarAniosTarifasEmpleados();
    this.accionListar();
  }

  //MÉTODO DE INICIALIZACIÓN DEL FORMULARIO:
  initForm(): void {
    this.liquidacionesForm = this.formBuilder.group({
      ctextPalabraClave: new FormControl(''),
      cboxTipoTarifaEmpleadoSeleccionado: new FormControl(''),
      cboxAnioTarifaEmpleadoSeleccionado: new FormControl(''),
      ctextFechaHMSInicio: new FormControl(''),
      ctextFechaHMSFin: new FormControl(''),
      cboxTandaNumeroRegistrosporPaginaSeleccionado: new FormControl('10')
    });
  }

  //CARGA LOS TIPOS DE TARIFA DE EMPLEADO REALES DESDE EL BACKEND (PARA EL COMBO "TIPO DE LIQUIDACIÓN"):
  cargarTiposTarifasEmpleados(): void {
    this.tiposTarifasEmpleadosService.findAllEmployeeRateTypes(undefined, undefined, undefined, 'nombreTipoTarifaEmpleado', 'ASC')
      .subscribe({
        next: (tipos) => { this.tiposTarifasEmpleados = tipos; },
        error: (err) => console.error('ERROR AL CARGAR TIPOS DE TARIFAS DE EMPLEADOS: ', err)
      });
  }

  //CARGA LOS AÑOS DISTINTOS DE TODAS LAS TARIFAS DE EMPLEADOS REGISTRADAS (SIN FILTROS) PARA EL COMBO DE
  //FILTRO POR AÑO — SE CONSULTA UNA SOLA VEZ Y NO SE VUELVE A RECARGAR CON CADA BÚSQUEDA, PARA QUE EL
  //COMBO SIEMPRE MUESTRE TODOS LOS AÑOS DISPONIBLES SIN IMPORTAR LOS DEMÁS FILTROS ACTIVOS:
  cargarAniosTarifasEmpleados(): void {
    this.tarifasEmpleadosService.findAllEmployeeRates()
      .subscribe({
        next: (data) => {
          const anios = new Set<number>(data.map(tarifa => Number(tarifa.anioTarifaEmpleado)));
          this.aniosTarifasEmpleados = Array.from(anios).sort((a, b) => b - a);
        },
        error: (err) => console.error('ERROR AL CARGAR LOS AÑOS DE TARIFAS DE EMPLEADOS: ', err)
      });
  }

  //MÉTODO DE BÚSQUEDA: RESETEA LA PÁGINA A 0 Y LLAMA EL LISTADO:
  buscar(): void {
    this.paginaActual = 0;
    this.accionListar();
  }

  //MÉTODO DE ACCIÓN DE LISTAR: TRAE DEL BACKEND LOS EMPLEADOS, LAS TARIFAS DE EMPLEADOS (FILTRADAS POR TIPO DE
  //TARIFA Y AÑO), LAS PROGRAMACIONES DE TURNOS Y EL HISTORIAL DE MOVIMIENTOS (ENTRADA/SALIDA REALES), Y LUEGO
  //CALCULA EN EL CLIENTE LA LIQUIDACIÓN DE CADA EMPLEADO QUE COINCIDA CON EL MISMO PERFIL (TIPO DE EMPLEADO, TIPO
  //DE EMPLEADO PLANTA, CLASIFICACIÓN Y SUBCLASIFICACIÓN) DE ALGUNA TARIFA, DE ACUERDO A LAS HORAS DE ENTRADA Y
  //SALIDA REALES QUE CADA PROGRAMACIÓN DE TURNO LLEGUE A ABARCAR:
  accionListar(): void {
    const formValues = this.liquidacionesForm.value;
    const idTipoTarifaEmpleado: number | undefined = formValues.cboxTipoTarifaEmpleadoSeleccionado ? Number(formValues.cboxTipoTarifaEmpleadoSeleccionado) : undefined;
    const anioTarifaEmpleado: number | undefined = formValues.cboxAnioTarifaEmpleadoSeleccionado ? Number(formValues.cboxAnioTarifaEmpleadoSeleccionado) : undefined;

    forkJoin({
      empleados: this.empleadosService.findAllEmployees(undefined, undefined, undefined, undefined, undefined, undefined, 'idEmpleado', 'ASC'),
      tarifas: this.tarifasEmpleadosService.findAllEmployeeRates(undefined, undefined, undefined, undefined, undefined, undefined, idTipoTarifaEmpleado, anioTarifaEmpleado, undefined, 'idTarifaEmpleado', 'ASC'),
      programaciones: this.programacionesTurnosEmpleadosService.findAllEmployeeShiftSchedules(undefined, undefined, 'idProgramacionTurnoEmpleado', 'ASC'),
      historial: this.historialMovimientosEmpleadosService.findAllEmployeeMovementHistories(undefined, undefined, 'idHistorialMovimientoEmpleado', 'ASC')
    }).subscribe({
      next: ({ empleados, tarifas, programaciones, historial }) => {
        this.empleadosCompleto = empleados;
        this.tarifasEmpleadosCompleto = tarifas;
        this.programacionesTurnosCompleto = programaciones;
        this.historialMovimientosCompleto = historial;
        this.calcularLiquidaciones();
      },
      error: (err) => console.error('ERROR AL LISTAR LIQUIDACIONES DE EMPLEADOS: ', err)
    });
  }

  //CALCULA, PARA CADA TARIFA CARGADA, LOS EMPLEADOS CUYO PERFIL (TIPO DE EMPLEADO, TIPO DE EMPLEADO PLANTA,
  //CLASIFICACIÓN Y SUBCLASIFICACIÓN) COINCIDE EXACTAMENTE CON EL DE LA TARIFA, Y LES CLASIFICA LAS HORAS DE SUS
  //PROGRAMACIONES DE TURNO FINALIZADAS EN EL AÑO DE ESA TARIFA SEGÚN EL TIPO DE TARIFA (DIURNA/NOCTURNA,
  //ORDINARIA/EXTRA, DOMINICAL) PARA QUE CADA UNA DE LAS 12 TARIFAS DEL PERFIL SOLO LIQUIDE LA PORCIÓN DE HORAS
  //QUE LE CORRESPONDE, EN VEZ DE LIQUIDAR EL TOTAL DE HORAS TRABAJADAS UNA VEZ POR CADA TARIFA:
  private calcularLiquidaciones(): void {
    const formValues = this.liquidacionesForm.value;
    const palabraClave = (formValues.ctextPalabraClave || '').trim().toUpperCase();

    //RANGO DE FECHA/HORA OPCIONAL PARA ACOTAR LA LIQUIDACIÓN: SI SE INDICA, CADA TURNO SE RECORTA A LA PORCIÓN
    //QUE CAE DENTRO DEL RANGO (UN EXTREMO PUEDE QUEDAR VACÍO PARA "DESDE" O "HASTA" ABIERTO):
    const fechaInicioFiltro: Date | undefined = formValues.ctextFechaHMSInicio ? new Date(formValues.ctextFechaHMSInicio) : undefined;
    const fechaFinFiltro: Date | undefined = formValues.ctextFechaHMSFin ? new Date(formValues.ctextFechaHMSFin) : undefined;

    //VENTANA DIURNA DERIVADA DE LOS TURNOS REALMENTE CARGADOS (tabla_turnos), NO UN VALOR FIJO EN EL CÓDIGO:
    const ventanaDiurna = this.determinarVentanaDiurnaDesdeCatalogo();

    //CACHÉ POR (EMPLEADO, AÑO) PARA NO RECLASIFICAR LAS MISMAS PROGRAMACIONES DE TURNO UNA VEZ POR CADA UNA DE
    //LAS 12 TARIFAS QUE PUEDE TENER UN MISMO PERFIL DE EMPLEADO:
    const cacheHorasClasificadas = new Map<string, Map<string, number>>();

    const liquidacionesCalculadas: LiquidacionCalculadaI[] = [];
    for (const tarifa of this.tarifasEmpleadosCompleto) {
      const empleadosCoincidentes = this.empleadosCompleto.filter(empleado => this.coincideConPerfilDeTarifa(empleado, tarifa));
      const anioTarifaEmpleado = Number(tarifa.anioTarifaEmpleado);
      const nombreTipoTarifaEmpleado = String(tarifa.tipoTarifaEmpleadoDTO?.nombreTipoTarifaEmpleado || '').toUpperCase();

      for (const empleado of empleadosCoincidentes) {
        const claveCache = `${empleado.idEmpleado}_${anioTarifaEmpleado}`;
        let horasClasificadas = cacheHorasClasificadas.get(claveCache);
        if (!horasClasificadas) {
          horasClasificadas = this.clasificarHorasTrabajadasPorEmpleado(Number(empleado.idEmpleado), anioTarifaEmpleado, ventanaDiurna, fechaInicioFiltro, fechaFinFiltro);
          cacheHorasClasificadas.set(claveCache, horasClasificadas);
        }

        const horasTrabajadas = horasClasificadas.get(nombreTipoTarifaEmpleado) || 0;
        if (horasTrabajadas <= 0) continue; //ESTE TIPO DE TARIFA NO LLEGÓ A CUBRIR NINGUNA HORA DE ESTE EMPLEADO EN EL AÑO.

        const valorBruto = horasTrabajadas * Number(tarifa.valorHoraTarifaEmpleado || 0);
        liquidacionesCalculadas.push({ empleado, tarifa, horasTrabajadas, valorBruto });
      }
    }

    //FILTRO POR PALABRA CLAVE (NOMBRE, APELLIDOS O DOCUMENTO DEL EMPLEADO):
    this.liquidacionesFiltradas = palabraClave
      ? liquidacionesCalculadas.filter(liq => {
          const nombreCompleto = `${liq.empleado.nombresEmpleado} ${liq.empleado.primerApellidoEmpleado} ${liq.empleado.segundoApellidoEmpleado || ''}`.toUpperCase();
          return nombreCompleto.includes(palabraClave) ||
            String(liq.empleado.numeroDocumentoIdentificacionEmpleado || '').toUpperCase().includes(palabraClave);
        })
      : liquidacionesCalculadas;

    this.totalRegistros = this.liquidacionesFiltradas.length;
    this.totalValorBruto = this.liquidacionesFiltradas.reduce((acumulado, liq) => acumulado + liq.valorBruto, 0);
    this.totalValorNeto = this.totalValorBruto * (1 - this.porcentajeDescuentoLiquidacion);
    this.subtotalesPorAnio = this.calcularSubtotalesPorAnio(this.liquidacionesFiltradas);
    this.paginaActual = 0;
    this.paginarResultado();
  }

  //AGRUPA EL LISTADO YA FILTRADO POR anioTarifaEmpleado Y SUMA REGISTROS/VALOR BRUTO/VALOR NETO DE CADA AÑO,
  //PARA EL DESGLOSE DEBAJO DEL SEMÁFORO (EL SEMÁFORO DE ARRIBA SIGUE MOSTRANDO EL TOTAL GENERAL):
  private calcularSubtotalesPorAnio(liquidaciones: LiquidacionCalculadaI[]): SubtotalPorAnioI[] {
    const subtotalesPorAnio = new Map<number, SubtotalPorAnioI>();

    for (const liquidacion of liquidaciones) {
      const anio = Number(liquidacion.tarifa.anioTarifaEmpleado);
      const subtotal = subtotalesPorAnio.get(anio) || { anio, totalRegistros: 0, totalValorBruto: 0, totalValorNeto: 0 };
      subtotal.totalRegistros += 1;
      subtotal.totalValorBruto += liquidacion.valorBruto;
      subtotal.totalValorNeto = subtotal.totalValorBruto * (1 - this.porcentajeDescuentoLiquidacion);
      subtotalesPorAnio.set(anio, subtotal);
    }

    return Array.from(subtotalesPorAnio.values()).sort((a, b) => b.anio - a.anio);
  }

  //VERIFICA SI EL PERFIL DEL EMPLEADO (TIPO DE EMPLEADO, TIPO DE EMPLEADO PLANTA, CLASIFICACIÓN Y SUBCLASIFICACIÓN)
  //COINCIDE EXACTAMENTE CON EL PERFIL DECLARADO EN LA TARIFA DE EMPLEADO:
  private coincideConPerfilDeTarifa(empleado: EmpleadosI, tarifa: TarifasEmpleadosI): boolean {
    return empleado.tipoEmpleadoDTO?.idTipoEmpleado === tarifa.tipoEmpleadoDTO?.idTipoEmpleado &&
      empleado.tipoEmpleadoPlantaDTO?.idTipoEmpleadoPlanta === tarifa.tipoEmpleadoPlantaDTO?.idTipoEmpleadoPlanta &&
      empleado.clasificacionEmpleadoPlantaDTO?.idClasificacionEmpleadoPlanta === tarifa.clasificacionEmpleadoPlantaDTO?.idClasificacionEmpleadoPlanta &&
      empleado.subclasificacionEmpleadoPlantaDTO?.idSubclasificacionEmpleadoPlanta === tarifa.subclasificacionEmpleadoPlantaDTO?.idSubclasificacionEmpleadoPlanta;
  }

  //TOMA LAS PROGRAMACIONES DE TURNO YA FINALIZADAS DEL EMPLEADO EN EL AÑO DE LA TARIFA (LAS "ACTIVO" AÚN NO
  //TERMINARON Y NO SE LIQUIDAN) Y, POR CADA UNA, BUSCA SU ENTRADA/SALIDA REAL EN EL HISTORIAL DE MOVIMIENTOS
  //(EL PONCHE REAL, QUE PUEDE DIFERIR DE LO PROGRAMADO), LA RECORTA AL RANGO fechaInicioFiltro/fechaFinFiltro SI
  //SE INDICÓ, Y DESCOMPONE ESE RANGO EN TRAMOS DIURNOS/NOCTURNOS, CLASIFICÁNDOLOS EN ORDINARIO O EXTRA SEGÚN LA
  //DURACIÓN NOMINAL DEL turnoDTO ASIGNADO (8, 12 O 24 HORAS SEGÚN EL TURNO — NO UN NÚMERO FIJO), Y EN DOMINICAL SI
  //CAEN EN DOMINGO. DEVUELVE UN MAPA nombreTipoTarifaEmpleado → HORAS ACUMULADAS EN ESE TIPO DURANTE TODO EL AÑO:
  private clasificarHorasTrabajadasPorEmpleado(idEmpleado: number, anioTarifaEmpleado: number, ventanaDiurna: { horaInicio: number; horaFin: number }, fechaInicioFiltro?: Date, fechaFinFiltro?: Date): Map<string, number> {
    const horasPorTipo = new Map<string, number>();

    const programacionesDelEmpleado = this.programacionesTurnosCompleto.filter(programacion =>
      programacion.empleadoDTO?.idEmpleado === idEmpleado &&
      String(programacion.estadoProgramacionTurnoEmpleado || '').toUpperCase() === 'FINALIZADO'
    );

    for (const programacion of programacionesDelEmpleado) {
      const intervaloReal = this.obtenerIntervaloRealDeProgramacion(programacion);
      if (!intervaloReal) continue;

      //RECORTA EL TURNO REAL AL RANGO FILTRADO (SI SE INDICÓ ALGÚN EXTREMO); SI EL TURNO QUEDA TOTALMENTE FUERA
      //DEL RANGO, SE DESCARTA:
      const inicioRecortado = fechaInicioFiltro && fechaInicioFiltro.getTime() > intervaloReal.inicio.getTime() ? fechaInicioFiltro : intervaloReal.inicio;
      const finRecortado = fechaFinFiltro && fechaFinFiltro.getTime() < intervaloReal.fin.getTime() ? fechaFinFiltro : intervaloReal.fin;
      if (finRecortado.getTime() <= inicioRecortado.getTime() || inicioRecortado.getFullYear() !== anioTarifaEmpleado) continue;

      //HORAS DEL TURNO YA TRANSCURRIDAS ANTES DEL PUNTO DE RECORTE, PARA QUE EL UMBRAL ORDINARIA/EXTRA SIGA
      //CONTANDO DESDE EL INICIO REAL DEL TURNO Y NO SE "REINICIE" AL RECORTAR A MITAD DE TURNO:
      const horasYaAcumuladasAntesDelRecorte = (inicioRecortado.getTime() - intervaloReal.inicio.getTime()) / (1000 * 60 * 60);

      const horasOrdinariasDelTurno = this.duracionNominalTurnoEnHoras(programacion.turnoDTO);
      this.clasificarTurno(inicioRecortado, finRecortado, horasOrdinariasDelTurno, ventanaDiurna, horasPorTipo, horasYaAcumuladasAntesDelRecorte);
    }

    return horasPorTipo;
  }

  //BUSCA EN EL HISTORIAL DE MOVIMIENTOS LOS PONCHES REALES DE ENTRADA Y SALIDA LIGADOS A ESTA PROGRAMACIÓN DE
  //TURNO (id_programacion_turno_empleado). ESTAS HORAS SON LAS QUE REALMENTE SE LIQUIDAN, YA QUE PUEDEN DIFERIR
  //POR UNOS MINUTOS DEL HORARIO PROGRAMADO. SI LA PROGRAMACIÓN NO TIENE PONCHES EN EL HISTORIAL (POR EJEMPLO, UN
  //DATO INCOMPLETO), SE USA COMO RESPALDO EL HORARIO PROGRAMADO DE LA PROPIA PROGRAMACIÓN DE TURNO:
  private obtenerIntervaloRealDeProgramacion(programacion: ProgramacionTurnoEmpleadoI): { inicio: Date; fin: Date } | null {
    const movimientosDeLaProgramacion = this.historialMovimientosCompleto
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

  //DESCOMPONE UNA SOLA PROGRAMACIÓN DE TURNO (ENTRADA→SALIDA REAL, YA RECORTADA AL RANGO FILTRADO SI APLICA) EN
  //TRAMOS QUE NO CRUCEN NI MEDIANOCHE NI EL LÍMITE DIURNA/NOCTURNA, Y ACUMULA CADA TRAMO EN EL TIPO DE TARIFA QUE
  //LE CORRESPONDE, RESPETANDO EL UMBRAL DE HORAS ORDINARIAS PROPIO DE ESE TURNO (horasOrdinariasDelTurno).
  //horasYaAcumuladasEnTurno PERMITE ARRANCAR EL CONTADOR DESDE UN PUNTO DISTINTO DE CERO CUANDO entrada NO ES EL
  //VERDADERO INICIO DEL TURNO SINO UN RECORTE A MITAD DE TURNO (PARA NO "REINICIAR" EL UMBRAL ORDINARIA/EXTRA):
  private clasificarTurno(entrada: Date, salida: Date, horasOrdinariasDelTurno: number, ventanaDiurna: { horaInicio: number; horaFin: number }, horasPorTipo: Map<string, number>, horasYaAcumuladasEnTurno: number = 0): void {
    let cursor = entrada;
    let horasAcumuladasEnTurno = horasYaAcumuladasEnTurno;

    while (cursor.getTime() < salida.getTime()) {
      const inicioJornadaDiurna = this.horaDelDia(cursor, ventanaDiurna.horaInicio);
      const finJornadaDiurna = this.horaDelDia(cursor, ventanaDiurna.horaFin);
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
        this.acumularHoras(horasPorTipo, this.nombreTipoTarifa(esDominical, esDiurna, false), horasOrdinariasEnTramo);
      }
      if (horasExtraEnTramo > 0) {
        this.acumularHoras(horasPorTipo, this.nombreTipoTarifa(esDominical, esDiurna, true), horasExtraEnTramo);
      }

      horasAcumuladasEnTurno += horasTramo;
      cursor = finTramo;
    }
  }

  //BUSCA ENTRE LAS PROGRAMACIONES CARGADAS UN TURNO "DIURNO" DE MENOS DE 24 HORAS Y USA SU PROPIO HORARIO
  //(hmsiniciacionTurno/hmsfinalizacionTurno DE tabla_turnos) COMO VENTANA DIURNA PARA TODA LA CLASIFICACIÓN — ASÍ
  //LA VENTANA SALE DE LOS DATOS REALES DEL NEGOCIO EN VEZ DE UN VALOR FIJO EN EL CÓDIGO. SOLO SI NO HAY NINGÚN
  //TURNO DIURNO CARGADO SE USA COMO ÚLTIMO RECURSO EL HORARIO DIURNO VIGENTE EN LA LEY LABORAL COLOMBIANA
  //(06:00–19:00), Y ÚNICAMENTE PARA PODER PARTIR LOS TURNOS DE 24 HORAS QUE ABARCAN DÍA Y NOCHE:
  private determinarVentanaDiurnaDesdeCatalogo(): { horaInicio: number; horaFin: number } {
    const turnoDiurnoReferencia = this.programacionesTurnosCompleto
      .map(programacion => programacion.turnoDTO)
      .find(turno => turno && String(turno.nombreTurno || '').toUpperCase().includes('DIURNO') && this.duracionNominalTurnoEnHoras(turno) < 24);

    if (turnoDiurnoReferencia) {
      return {
        horaInicio: this.horaDecimal(String(turnoDiurnoReferencia.hmsiniciacionTurno)),
        horaFin: this.horaDecimal(String(turnoDiurnoReferencia.hmsfinalizacionTurno))
      };
    }

    return { horaInicio: 6, horaFin: 19 };
  }

  //CALCULA LA DURACIÓN NOMINAL (PROGRAMADA) DE UN TURNO EN HORAS A PARTIR DE SU PROPIO HORARIO DE tabla_turnos,
  //MANEJANDO TURNOS QUE CRUZAN MEDIANOCHE (HORA FIN < HORA INICIO) Y TURNOS DE 24 HORAS (HORA INICIO = HORA FIN):
  private duracionNominalTurnoEnHoras(turno: TurnosI | undefined): number {
    if (!turno) return 0;
    const horaInicio = this.horaDecimal(String(turno.hmsiniciacionTurno));
    const horaFin = this.horaDecimal(String(turno.hmsfinalizacionTurno));
    if (horaFin === horaInicio) return 24;
    return horaFin > horaInicio ? (horaFin - horaInicio) : (24 - horaInicio + horaFin);
  }

  //CONVIERTE UN TEXTO "HH:mm:ss" DE tabla_turnos A UN NÚMERO DECIMAL DE HORAS (EJ. "18:30:00" → 18.5):
  private horaDecimal(horaTexto: string): number {
    const partes = horaTexto.split(':').map(Number);
    const horas = partes[0] || 0;
    const minutos = partes[1] || 0;
    const segundos = partes[2] || 0;
    return horas + minutos / 60 + segundos / 3600;
  }

  //CONSTRUYE UNA FECHA EN EL MISMO DÍA CALENDARIO DE referencia A LA HORA DECIMAL INDICADA:
  private horaDelDia(referencia: Date, horaDecimalValor: number): Date {
    const horas = Math.floor(horaDecimalValor);
    const minutos = Math.round((horaDecimalValor - horas) * 60);
    return new Date(referencia.getFullYear(), referencia.getMonth(), referencia.getDate(), horas, minutos, 0, 0);
  }

  //TRADUCE LA COMBINACIÓN DOMINICAL/DIURNA/EXTRA AL NOMBRE EXACTO DEL TIPO DE TARIFA REGISTRADO EN
  //tabla_tipos_tarifas_empleados (LOS TIPOS FESTIVOS NO SE GENERAN AÚN — VER EL COMENTARIO JUNTO A LOS LÍMITES DE JORNADA):
  private nombreTipoTarifa(esDominical: boolean, esDiurna: boolean, esExtra: boolean): string {
    const momentoDelDia = esDiurna ? 'DIURNA' : 'NOCTURNA';
    if (esDominical) {
      return esExtra ? `HORA EXTRA DOMINICAL ${momentoDelDia}` : `HORA DOMINICAL ${momentoDelDia}`;
    }
    return esExtra ? `HORA EXTRA ${momentoDelDia}` : `HORA ORDINARIA ${momentoDelDia}`;
  }

  //SUMA HORAS A UN TIPO DE TARIFA DENTRO DEL MAPA DE ACUMULACIÓN:
  private acumularHoras(horasPorTipo: Map<string, number>, nombreTipoTarifaEmpleado: string, horas: number): void {
    horasPorTipo.set(nombreTipoTarifaEmpleado, (horasPorTipo.get(nombreTipoTarifaEmpleado) || 0) + horas);
  }

  //TOMA LA PÁGINA ACTUAL DEL LISTADO YA FILTRADO EN MEMORIA:
  private paginarResultado(): void {
    const inicio = this.paginaActual * this.tandaNumeroRegistrosporPagina;
    this.liquidaciones = this.liquidacionesFiltradas.slice(inicio, inicio + this.tandaNumeroRegistrosporPagina);
  }

  //MÉTODO PARA CALCULAR EL TOTAL DE PÁGINAS:
  calcularTotalPaginas(): number {
    const total = Math.ceil(this.totalRegistros / this.tandaNumeroRegistrosporPagina);
    return total > 0 ? total : 1;
  }

  //MÉTODO PARA CAMBIAR DE PÁGINA:
  cambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
    this.paginarResultado();
  }

  //MÉTODO PARA SELECCIONAR TANDA DE REGISTROS POR PÁGINA:
  seleccionarTandaNumeroRegistrosporPagina(): void {
    this.tandaNumeroRegistrosporPagina = Number(this.liquidacionesForm.value.cboxTandaNumeroRegistrosporPaginaSeleccionado);
    this.paginaActual = 0;
    this.paginarResultado();
  }

  //CALCULA EL VALOR DE LOS DESCUENTOS DE LEY SOBRE EL VALOR BRUTO DE LA LIQUIDACIÓN:
  calcularValorDescuentos(liquidacion: LiquidacionCalculadaI): number {
    return liquidacion.valorBruto * this.porcentajeDescuentoLiquidacion;
  }

  //CALCULA EL VALOR NETO DE LA LIQUIDACIÓN (VALOR BRUTO YA DESCONTADOS LOS DESCUENTOS DE LEY):
  calcularValorNeto(liquidacion: LiquidacionCalculadaI): number {
    return liquidacion.valorBruto - this.calcularValorDescuentos(liquidacion);
  }

  //FORMATEA UN VALOR NUMÉRICO COMO MONEDA COLOMBIANA:
  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor);
  }
}
