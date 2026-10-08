//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';

//IMPORTACIÓN DE INTERFACES:
import { TarifasEmpleadosI } from '../../../interfaces/panel-control/tarifas-empleados/tarifas-empleados.interface';
import { TiposTarifasEmpleadosI } from '../../../interfaces/panel-control/tipos-tarifas-empleados/tipos-tarifas-empleados.interface';
import { EmpleadosI } from '../../../interfaces/gestion-personal/empleados/empleados.interface';
import { ProgramacionTurnoEmpleadoI } from '../../../interfaces/gestion-personal/programaciones-turnos-empleados/programaciones-turnos-empleados.interface';
import { HistorialMovimientosEmpleadosI } from '../../../interfaces/gestion-personal/historial-movimientos-empleados/historialMovimientosEmpleados.interface';

//IMPORTACIÓN DE SERVICIOS:
import { TarifasEmpleadosService } from '../../../services/panel-control/tarifas-empleados/tarifas-empleados.service';
import { TiposTarifasEmpleadosService } from '../../../services/panel-control/tipos-tarifas-empleados/tipos-tarifas-empleados.service';
import { EmpleadosService } from '../../../services/gestion-personal/empleados/empleados.service';
import { ProgramacionesTurnosEmpleadosService } from '../../../services/gestion-personal/programaciones-turnos-empleados/programacionesTurnosEmpleados.service';
import { HistorialMovimientosEmpleadosService } from '../../../services/gestion-personal/historial-movimientos-empleados/historialMovimientosEmpleados.service';

//FUNCIONES PURAS DE CLASIFICACIÓN DE HORAS (COMPARTIDAS CON EL DASHBOARD DE INICIO, VER
//liquidacion-empleado-calculo.util.ts):
import { determinarVentanaDiurnaDesdeCatalogo, clasificarHorasTrabajadasPorEmpleado } from '../../../services/gestion-personal/liquidaciones-empleados/liquidacion-empleado-calculo.util';

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
    const ventanaDiurna = determinarVentanaDiurnaDesdeCatalogo(this.programacionesTurnosCompleto);

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
          horasClasificadas = clasificarHorasTrabajadasPorEmpleado(Number(empleado.idEmpleado), anioTarifaEmpleado, ventanaDiurna, this.programacionesTurnosCompleto, this.historialMovimientosCompleto, fechaInicioFiltro, fechaFinFiltro);
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
