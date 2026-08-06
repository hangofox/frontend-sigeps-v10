//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';

//IMPORTACIÓN DE INTERFACES:
import { TarifasEmpleadosI } from '../../../interfaces/panel-control/tarifas-empleados/tarifas-empleados.interface';
import { TiposTarifasEmpleadosI } from '../../../interfaces/panel-control/tipos-tarifas-empleados/tipos-tarifas-empleados.interface';
import { EmpleadosI } from '../../../interfaces/gestion-personal/empleados/empleados.interface';
import { HistorialMovimientosEmpleadosI } from '../../../interfaces/gestion-personal/historial-movimientos-empleados/historialMovimientosEmpleados.interface';

//IMPORTACIÓN DE SERVICIOS:
import { TarifasEmpleadosService } from '../../../services/panel-control/tarifas-empleados/tarifas-empleados.service';
import { TiposTarifasEmpleadosService } from '../../../services/panel-control/tipos-tarifas-empleados/tipos-tarifas-empleados.service';
import { EmpleadosService } from '../../../services/gestion-personal/empleados/empleados.service';
import { HistorialMovimientosEmpleadosService } from '../../../services/gestion-personal/historial-movimientos-empleados/historialMovimientosEmpleados.service';

//AGRUPACIÓN DE UN EMPLEADO CON LA TARIFA DE SU PERFIL Y LAS HORAS QUE ESA TARIFA LLEGÓ A CUBRIR, PARA CALCULAR SU LIQUIDACIÓN:
interface LiquidacionCalculadaI {
  empleado: EmpleadosI;
  tarifa: TarifasEmpleadosI;
  horasTrabajadas: number;
  valorBruto: number;
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

  //TIPOS DE TARIFA DE EMPLEADO — CARGADOS DESDE EL BACKEND (SE USAN COMO "TIPO DE LIQUIDACIÓN" EN EL COMBO DE FILTRO):
  tiposTarifasEmpleados: TiposTarifasEmpleadosI[] = [];

  //AÑOS DISTINTOS DE LAS TARIFAS DE EMPLEADOS REGISTRADAS EN EL BACKEND (PARA EL COMBO DE FILTRO POR AÑO):
  aniosTarifasEmpleados: number[] = [];

  //CATÁLOGOS COMPLETOS TRAÍDOS DEL BACKEND, BASE PARA CALCULAR LAS LIQUIDACIONES:
  private empleadosCompleto: EmpleadosI[] = [];
  private tarifasEmpleadosCompleto: TarifasEmpleadosI[] = [];
  private historialMovimientosCompleto: HistorialMovimientosEmpleadosI[] = [];

  //LIQUIDACIONES YA CALCULADAS Y FILTRADAS, SIN PAGINAR (BASE PARA CALCULAR LOS TOTALES REALES DEL SEMÁFORO):
  private liquidacionesFiltradas: LiquidacionCalculadaI[] = [];

  //LISTA DE LA PÁGINA ACTUAL A MOSTRAR EN LA TABLA:
  liquidaciones: LiquidacionCalculadaI[] = [];

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private formBuilder: FormBuilder,
    private tarifasEmpleadosService: TarifasEmpleadosService,
    private tiposTarifasEmpleadosService: TiposTarifasEmpleadosService,
    private empleadosService: EmpleadosService,
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
  //TARIFA Y AÑO) Y EL HISTORIAL DE MOVIMIENTOS, Y LUEGO CALCULA EN EL CLIENTE LA LIQUIDACIÓN DE CADA EMPLEADO
  //QUE COINCIDA CON EL MISMO PERFIL (TIPO DE EMPLEADO, TIPO DE EMPLEADO PLANTA, CLASIFICACIÓN Y SUBCLASIFICACIÓN)
  //DE ALGUNA TARIFA, DE ACUERDO A LAS HORAS DE ENTRADA Y SALIDA QUE ESA TARIFA LLEGUE A ABARCAR:
  accionListar(): void {
    const formValues = this.liquidacionesForm.value;
    const idTipoTarifaEmpleado: number | undefined = formValues.cboxTipoTarifaEmpleadoSeleccionado ? Number(formValues.cboxTipoTarifaEmpleadoSeleccionado) : undefined;
    const anioTarifaEmpleado: number | undefined = formValues.cboxAnioTarifaEmpleadoSeleccionado ? Number(formValues.cboxAnioTarifaEmpleadoSeleccionado) : undefined;

    forkJoin({
      empleados: this.empleadosService.findAllEmployees(undefined, undefined, undefined, undefined, undefined, undefined, 'idEmpleado', 'ASC'),
      tarifas: this.tarifasEmpleadosService.findAllEmployeeRates(undefined, undefined, undefined, undefined, undefined, undefined, idTipoTarifaEmpleado, anioTarifaEmpleado, undefined, 'idTarifaEmpleado', 'ASC'),
      historial: this.historialMovimientosEmpleadosService.findAllEmployeeMovementHistories(undefined, undefined, 'idHistorialMovimientoEmpleado', 'ASC')
    }).subscribe({
      next: ({ empleados, tarifas, historial }) => {
        this.empleadosCompleto = empleados;
        this.tarifasEmpleadosCompleto = tarifas;
        this.historialMovimientosCompleto = historial;
        this.calcularLiquidaciones();
      },
      error: (err) => console.error('ERROR AL LISTAR LIQUIDACIONES DE EMPLEADOS: ', err)
    });
  }

  //CALCULA, PARA CADA TARIFA CARGADA, LOS EMPLEADOS CUYO PERFIL (TIPO DE EMPLEADO, TIPO DE EMPLEADO PLANTA,
  //CLASIFICACIÓN Y SUBCLASIFICACIÓN) COINCIDE EXACTAMENTE CON EL DE LA TARIFA, Y LES CALCULA LAS HORAS TRABAJADAS
  //(PARES ENTRADA→SALIDA DE SU HISTORIAL DE MOVIMIENTOS EN EL AÑO DE ESA TARIFA) PARA OBTENER EL VALOR BRUTO A LIQUIDAR:
  private calcularLiquidaciones(): void {
    const palabraClave = (this.liquidacionesForm.value.ctextPalabraClave || '').trim().toUpperCase();

    const liquidacionesCalculadas: LiquidacionCalculadaI[] = [];
    for (const tarifa of this.tarifasEmpleadosCompleto) {
      const empleadosCoincidentes = this.empleadosCompleto.filter(empleado => this.coincideConPerfilDeTarifa(empleado, tarifa));

      for (const empleado of empleadosCoincidentes) {
        const horasTrabajadas = this.calcularHorasTrabajadasPorEmpleado(Number(empleado.idEmpleado), Number(tarifa.anioTarifaEmpleado));
        if (horasTrabajadas <= 0) continue; //ESTA TARIFA NO LLEGÓ A CUBRIR NINGUNA HORA DE ENTRADA/SALIDA DE ESTE EMPLEADO.

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
    this.paginaActual = 0;
    this.paginarResultado();
  }

  //VERIFICA SI EL PERFIL DEL EMPLEADO (TIPO DE EMPLEADO, TIPO DE EMPLEADO PLANTA, CLASIFICACIÓN Y SUBCLASIFICACIÓN)
  //COINCIDE EXACTAMENTE CON EL PERFIL DECLARADO EN LA TARIFA DE EMPLEADO:
  private coincideConPerfilDeTarifa(empleado: EmpleadosI, tarifa: TarifasEmpleadosI): boolean {
    return empleado.tipoEmpleadoDTO?.idTipoEmpleado === tarifa.tipoEmpleadoDTO?.idTipoEmpleado &&
      empleado.tipoEmpleadoPlantaDTO?.idTipoEmpleadoPlanta === tarifa.tipoEmpleadoPlantaDTO?.idTipoEmpleadoPlanta &&
      empleado.clasificacionEmpleadoPlantaDTO?.idClasificacionEmpleadoPlanta === tarifa.clasificacionEmpleadoPlantaDTO?.idClasificacionEmpleadoPlanta &&
      empleado.subclasificacionEmpleadoPlantaDTO?.idSubclasificacionEmpleadoPlanta === tarifa.subclasificacionEmpleadoPlantaDTO?.idSubclasificacionEmpleadoPlanta;
  }

  //RECORRE EL HISTORIAL DE MOVIMIENTOS DEL EMPLEADO EN ORDEN CRONOLÓGICO Y SUMA LAS HORAS DE CADA PAR
  //ENTRADA→SALIDA QUE CAIGA DENTRO DEL AÑO DE LA TARIFA (LAS ENTRADAS SIN SALIDA POSTERIOR NO SE CUENTAN):
  private calcularHorasTrabajadasPorEmpleado(idEmpleado: number, anioTarifaEmpleado: number): number {
    const movimientosDelEmpleado = this.historialMovimientosCompleto
      .filter(movimiento => movimiento.empleadoDTO?.idEmpleado === idEmpleado)
      .map(movimiento => ({
        fecha: new Date(String(movimiento.fechaHMSHistorialMovimientoEmpleado).replace(' ', 'T')),
        nombreTipoMovimiento: String(movimiento.tipoMovimientoDTO?.nombreTipoMovimiento || '').toUpperCase()
      }))
      .filter(movimiento => movimiento.fecha.getFullYear() === anioTarifaEmpleado)
      .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

    let horasTotales = 0;
    let entradaPendiente: Date | null = null;

    for (const movimiento of movimientosDelEmpleado) {
      if (movimiento.nombreTipoMovimiento === 'ENTRADA') {
        entradaPendiente = movimiento.fecha;
      } else if (movimiento.nombreTipoMovimiento === 'SALIDA' && entradaPendiente) {
        const horasCubiertas = (movimiento.fecha.getTime() - entradaPendiente.getTime()) / (1000 * 60 * 60);
        if (horasCubiertas > 0) horasTotales += horasCubiertas;
        entradaPendiente = null;
      }
    }

    return horasTotales;
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
