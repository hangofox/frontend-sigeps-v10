//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

//IMPORTACIÓN DE INTERFACES:
import { EmpleadosI } from '../../../interfaces/gestion-personal/empleados/empleados.interface';
import { TipoEmpleadoI } from '../../../interfaces/gestion-personal/tipos-empleados/tipos-empleados.interface';
import { TipoEmpleadoPlantaI } from '../../../interfaces/gestion-personal/tipos-empleados-planta/tipos-empleados-planta.interface';
import { ClasificacionEmpleadoPlantaI } from '../../../interfaces/gestion-personal/clasificaciones-empleados-planta/clasificaciones-empleados-planta.interface';
import { SubclasificacionEmpleadoPlantaI } from '../../../interfaces/gestion-personal/clasificaciones-empleados-planta/subclasificaciones-empleados-planta/subclasificaciones-empleados-planta.interface';
import { HistorialMovimientosEmpleadosI } from '../../../interfaces/gestion-personal/historial-movimientos-empleados/historialMovimientosEmpleados.interface';

//IMPORTACIÓN DE SERVICIOS:
import { EmpleadosService } from '../../../services/gestion-personal/empleados/empleados.service';
import { TiposEmpleadosService } from '../../../services/gestion-personal/tipos-empleados/tiposEmpleados.service';
import { TiposEmpleadosPlantaService } from '../../../services/gestion-personal/tipos-empleados-planta/tiposEmpleadosPlanta.service';
import { ClasificacionesEmpleadosPlantaService } from '../../../services/gestion-personal/clasificaciones-empleados-planta/clasificacionesEmpleadosPlanta.service';
import { SubclasificacionesEmpleadosPlantaService } from '../../../services/gestion-personal/clasificaciones-empleados-planta/subclasificaciones-empleados-planta/subclasificacionesEmpleadosPlanta.service';
import { HistorialMovimientosEmpleadosService } from '../../../services/gestion-personal/historial-movimientos-empleados/historialMovimientosEmpleados.service';
import { SessionService } from '../../../services/session/session.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-listado-empleados',
  templateUrl: './listado-empleados.component.html',
  styleUrls: ['./listado-empleados.component.scss']
})
export class ListadoEmpleadosComponent implements OnInit {

  //DECLARACIÓN DE VARIABLES GLOBALES:
  isLoggedIn: boolean = false;
  nicknameUsuarioLogueado: string | null = null;
  empleadosForm!: FormGroup;

  //SEMÁFORO DE ESTADOS — CONTADORES:
  totalRegistros: number = 0;
  totalRegistrosEstadosActivos: number = 0;
  totalRegistrosEstadosInactivos: number = 0;

  //PAGINACIÓN:
  paginaActual: number = 0;
  tandaNumeroRegistrosporPagina: number = 10;

  //PRIVILEGIOS Y RESTRICCIONES DE ACCESO DEL USUARIO — SE ACTUALIZAN EN ngOnInit CON LOS PRIVILEGIOS Y RESTRICCIONES REALES:
  sioNoPrivilegioyRestriccionAccesoUsuarioCRUDVer: string = 'NO';
  sioNoPrivilegioyRestriccionAccesoUsuarioCRUDGuardar: string = 'NO';
  sioNoPrivilegioyRestriccionAccesoUsuarioCRUDModificar: string = 'NO';
  sioNoPrivilegioyRestriccionAccesoUsuarioCRUDEliminar: string = 'NO';

  //CATÁLOGO COMPLETO DE TIPOS DE EMPLEADO (PRIMER NIVEL DE LA CASCADA, NO TIENE PADRE):
  opcionesTiposEmpleados: TipoEmpleadoI[] = [];

  //CATÁLOGO COMPLETO DE TIPOS DE EMPLEADO PLANTA TRAÍDO DEL BACKEND (SE FILTRA POR REGLA DE NEGOCIO SEGÚN EL TIPO DE EMPLEADO):
  private tiposEmpleadosPlantaCompleto: TipoEmpleadoPlantaI[] = [];
  opcionesTiposEmpleadosPlanta: TipoEmpleadoPlantaI[] = [];

  //CATÁLOGOS COMPLETOS DE CLASIFICACIÓN Y SUBCLASIFICACIÓN TRAÍDOS DEL BACKEND (SE FILTRAN POR LA RELACIÓN
  //PADRE-HIJO REAL DECLARADA EN EL BACKEND: Clasificación → tipoEmpleadoPlantaDTO, Subclasificación → clasificacionEmpleadoPlantaDTO):
  private clasificacionesCompleto: ClasificacionEmpleadoPlantaI[] = [];
  private subclasificacionesCompleto: SubclasificacionEmpleadoPlantaI[] = [];
  opcionesClasificaciones: ClasificacionEmpleadoPlantaI[] = [];
  opcionesSubclasificaciones: SubclasificacionEmpleadoPlantaI[] = [];

  //LISTA COMPLETA TRAÍDA DEL BACKEND Y LISTA YA FILTRADA/PAGINADA QUE SE MUESTRA EN PANTALLA:
  private empleadosCompleto: EmpleadosI[] = [];
  empleados: EmpleadosI[] = [];

  //HISTORIAL DE MOVIMIENTOS COMPLETO, ÚLTIMO MOVIMIENTO Y ESTADO DE ACTIVIDAD CALCULADOS POR EMPLEADO
  //(ENTRADA => EN TURNO, SALIDA => EN DESCANSO):
  private historialMovimientosCompleto: HistorialMovimientosEmpleadosI[] = [];
  private ultimoMovimientoPorEmpleado = new Map<number, HistorialMovimientosEmpleadosI>();
  private estadoActividadPorEmpleado = new Map<number, string>();

  //ESTADO DE MODALES:
  modalAddUpdDelVisible: boolean = false;
  modalVistaVisible: boolean = false;
  modalModo: string = '';
  empleadoSeleccionado: EmpleadosI | null = null;

  //MODAL DE UBICACIÓN DEL TURNO ACTUAL (ESTABLECIMIENTO → SEDE → PUESTO) AL CLICKEAR "EN TURNO":
  modalUbicacionTurnoVisible: boolean = false;
  establecimientoEnTurno: any = null;
  sedeEnTurno: any = null;
  puestoEnTurno: any = null;
  programacionEnTurno: any = null;

  //TOAST GLOBAL:
  toastMensaje: string = '';
  toastTipo: string = '';
  private toastTimer: any = null;

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private formBuilder: FormBuilder,
    private empleadosService: EmpleadosService,
    private tiposEmpleadosService: TiposEmpleadosService,
    private tiposEmpleadosPlantaService: TiposEmpleadosPlantaService,
    private clasificacionesEmpleadosPlantaService: ClasificacionesEmpleadosPlantaService,
    private subclasificacionesEmpleadosPlantaService: SubclasificacionesEmpleadosPlantaService,
    private historialMovimientosEmpleadosService: HistorialMovimientosEmpleadosService,
    private sessionService: SessionService
  ) {}

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      this.isLoggedIn = true;
      this.nicknameUsuarioLogueado = localStorage.getItem('nicknameUsuarioLogueado');
    }
    this.initForm();
    this.actualizarPrivilegiosyRestriccionesCRUD();
    this.tiposEmpleadosService.findAllTypesOfEmployees(undefined, undefined, 'nombreTipoEmpleado', 'ASC').subscribe({
      next: (data) => { this.opcionesTiposEmpleados = data; },
      error: (err) => console.error('ERROR AL CARGAR TIPOS DE EMPLEADO: ', err)
    });
    this.tiposEmpleadosPlantaService.findAllTypesOfStaffEmployees(undefined, undefined, 'idTipoEmpleadoPlanta', 'ASC').subscribe({
      next: (data) => { this.tiposEmpleadosPlantaCompleto = data; },
      error: (err) => console.error('ERROR AL CARGAR TIPOS DE EMPLEADO PLANTA: ', err)
    });
    this.clasificacionesEmpleadosPlantaService.findAllClassificationsOfStaffEmployees(undefined, undefined, 'nombreClasificacionEmpleadoPlanta', 'ASC').subscribe({
      next: (data) => { this.clasificacionesCompleto = data; },
      error: (err) => console.error('ERROR AL CARGAR CLASIFICACIONES: ', err)
    });
    this.subclasificacionesEmpleadosPlantaService.findAllSubclassificationsOfStaffEmployees(undefined, undefined, 'nombreSubclasificacionEmpleadoPlanta', 'ASC').subscribe({
      next: (data) => { this.subclasificacionesCompleto = data; },
      error: (err) => console.error('ERROR AL CARGAR SUBCLASIFICACIONES: ', err)
    });
    this.historialMovimientosEmpleadosService.findAllEmployeeMovementHistories(undefined, undefined, 'idHistorialMovimientoEmpleado', 'ASC').subscribe({
      next: (data) => {
        this.historialMovimientosCompleto = data;
        this.calcularEstadoActividadPorEmpleado();
      },
      error: (err) => console.error('ERROR AL CARGAR HISTORIAL DE MOVIMIENTOS: ', err)
    });
    this.accionListar();
  }

  //CALCULA EL ÚLTIMO MOVIMIENTO Y EL ESTADO DE ACTIVIDAD DE CADA EMPLEADO A PARTIR DE SU HISTORIAL
  //(ENTRADA => EN TURNO, SALIDA => EN DESCANSO):
  private calcularEstadoActividadPorEmpleado(): void {
    this.ultimoMovimientoPorEmpleado.clear();

    this.historialMovimientosCompleto.forEach(movimiento => {
      const idEmpleado = movimiento.empleadoDTO?.idEmpleado;
      if (idEmpleado === undefined) return;
      const actual = this.ultimoMovimientoPorEmpleado.get(idEmpleado);
      const fechaMovimiento = new Date(String(movimiento.fechaHMSHistorialMovimientoEmpleado).replace(' ', 'T'));
      const fechaActual = actual ? new Date(String(actual.fechaHMSHistorialMovimientoEmpleado).replace(' ', 'T')) : null;
      if (!actual || fechaMovimiento > fechaActual!) {
        this.ultimoMovimientoPorEmpleado.set(idEmpleado, movimiento);
      }
    });

    this.estadoActividadPorEmpleado.clear();
    this.ultimoMovimientoPorEmpleado.forEach((movimiento, idEmpleado) => {
      const nombreTipoMovimiento = String(movimiento.tipoMovimientoDTO?.nombreTipoMovimiento || '').toUpperCase();
      const estadoActividad = nombreTipoMovimiento === 'ENTRADA' ? 'EN TURNO'
        : nombreTipoMovimiento === 'SALIDA' ? 'EN DESCANSO'
        : 'SIN REGISTROS';
      this.estadoActividadPorEmpleado.set(idEmpleado, estadoActividad);
    });
  }

  //MÉTODO USADO EN LA PLANTILLA PARA OBTENER EL ESTADO DE ACTIVIDAD DE UN EMPLEADO SEGÚN SU ÚLTIMO MOVIMIENTO:
  obtenerEstadoActividad(idEmpleado?: number): string {
    if (idEmpleado === undefined) return 'SIN REGISTROS';
    return this.estadoActividadPorEmpleado.get(idEmpleado) || 'SIN REGISTROS';
  }

  //AL CLICKEAR "EN TURNO": ABRE EL MODAL CON LA UBICACIÓN DEL TURNO (ESTABLECIMIENTO → SEDE → PUESTO)
  //TOMADA DEL ÚLTIMO MOVIMIENTO DE ENTRADA DEL EMPLEADO:
  abrirUbicacionTurno(idEmpleado?: number): void {
    if (idEmpleado === undefined || this.obtenerEstadoActividad(idEmpleado) !== 'EN TURNO') return;
    const movimiento = this.ultimoMovimientoPorEmpleado.get(idEmpleado);
    const programacion = movimiento?.programacionTurnoEmpleadoDTO;
    const puesto = programacion?.puestoSedeEstablecimientoClienteDTO;
    if (!puesto) return;
    this.puestoEnTurno = puesto;
    this.sedeEnTurno = puesto.sedeEstablecimientoClienteDTO;
    this.establecimientoEnTurno = puesto.sedeEstablecimientoClienteDTO?.establecimientoClienteDTO;
    this.programacionEnTurno = programacion;
    this.modalUbicacionTurnoVisible = true;
  }

  //MÉTODO PARA CERRAR EL MODAL DE UBICACIÓN DEL TURNO:
  cerrarModalUbicacionTurno(): void {
    this.modalUbicacionTurnoVisible = false;
    this.establecimientoEnTurno = null;
    this.sedeEnTurno = null;
    this.puestoEnTurno = null;
    this.programacionEnTurno = null;
  }

  //CONSULTA LOS PRIVILEGIOS Y RESTRICCIONES DE ACCESO REALES DEL USUARIO LOGUEADO Y ACTUALIZA LAS BANDERAS
  //QUE MUESTRAN U OCULTAN LOS BOTONES DE VER/GUARDAR/MODIFICAR/ELIMINAR DE ESTE CRUD:
  private actualizarPrivilegiosyRestriccionesCRUD(): void {
    this.sessionService.cargarPrivilegios().subscribe({
      next: () => {
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDVer = this.sessionService.tieneAcceso('VER EMPLEADOS') ? 'SI' : 'NO';
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDGuardar = this.sessionService.tieneAcceso('GUARDAR EMPLEADOS') ? 'SI' : 'NO';
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDModificar = this.sessionService.tieneAcceso('MODIFICAR EMPLEADOS') ? 'SI' : 'NO';
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDEliminar = this.sessionService.tieneAcceso('ELIMINAR EMPLEADOS') ? 'SI' : 'NO';
      },
      error: (err) => console.error('ERROR AL CARGAR LOS PRIVILEGIOS Y RESTRICCIONES DEL USUARIO: ', err)
    });
  }

  //MÉTODO DE INICIALIZACIÓN DEL FORMULARIO:
  initForm(): void {
    this.empleadosForm = this.formBuilder.group({
      ctextPalabraClave: new FormControl(''),
      cboxFiltroIdTipoEmpleado: new FormControl(''),
      cboxFiltroIdTipoEmpleadoPlanta: new FormControl(''),
      cboxFiltroIdClasificacion: new FormControl(''),
      cboxFiltroIdSubclasificacion: new FormControl(''),
      cboxTandaNumeroRegistrosporPaginaSeleccionado: new FormControl('10')
    });
  }

  //REGLA DE NEGOCIO: EL COMBO DE TIPO DE EMPLEADO PLANTA SOLO APLICA CUANDO EL TIPO DE EMPLEADO SELECCIONADO ES "PLANTA",
  //Y EN ESE CASO SOLO SE DESPLIEGAN LAS OPCIONES "ADMINISTRATIVO", "OPERATIVO" Y "NO APLICA" DEL CATÁLOGO. PARA CUALQUIER OTRO
  //TIPO DE EMPLEADO (O NINGUNO SELECCIONADO), EL COMBO SE RESETEA Y QUEDA SIN OPCIONES:
  actualizarOpcionesTipoEmpleadoPlanta(): void {
    const idTipoEmpleado = this.empleadosForm.value.cboxFiltroIdTipoEmpleado;
    const tipoEmpleadoSeleccionado = this.opcionesTiposEmpleados.find(t => t.idTipoEmpleado === Number(idTipoEmpleado));
    const esTipoEmpleadoPlanta = String(tipoEmpleadoSeleccionado?.nombreTipoEmpleado || '').toUpperCase() === 'PLANTA';

    this.opcionesTiposEmpleadosPlanta = esTipoEmpleadoPlanta
      ? this.tiposEmpleadosPlantaCompleto.filter(t => ['ADMINISTRATIVO', 'OPERATIVO', 'NO APLICA'].includes(String(t.nombreTipoEmpleadoPlanta).toUpperCase()))
      : [];
  }

  //RECALCULA LAS OPCIONES DE CLASIFICACIÓN Y SUBCLASIFICACIÓN FILTRANDO LOS CATÁLOGOS COMPLETOS POR LA RELACIÓN
  //PADRE-HIJO REAL DECLARADA EN EL BACKEND (Clasificación.tipoEmpleadoPlantaDTO Y Subclasificación.clasificacionEmpleadoPlantaDTO):
  recalcularOpcionesCascada(): void {
    const fv = this.empleadosForm.value;
    const idTipoEmpleadoPlanta = fv.cboxFiltroIdTipoEmpleadoPlanta;
    const idClasificacion = fv.cboxFiltroIdClasificacion;

    this.opcionesClasificaciones = idTipoEmpleadoPlanta
      ? this.clasificacionesCompleto.filter(c => c.tipoEmpleadoPlantaDTO?.idTipoEmpleadoPlanta === Number(idTipoEmpleadoPlanta))
      : [];

    this.opcionesSubclasificaciones = idClasificacion
      ? this.subclasificacionesCompleto.filter(s => s.clasificacionEmpleadoPlantaDTO?.idClasificacionEmpleadoPlanta === Number(idClasificacion))
      : [];
  }

  //AL CAMBIAR EL TIPO DE EMPLEADO: LIMPIA LOS 3 FILTROS HIJOS, ACTUALIZA TIPO PLANTA SEGÚN LA REGLA DE NEGOCIO,
  //RECALCULA LA CASCADA DE CLASIFICACIÓN/SUBCLASIFICACIÓN Y BUSCA:
  cambiarFiltroTipoEmpleado(): void {
    this.empleadosForm.patchValue({ cboxFiltroIdTipoEmpleadoPlanta: '', cboxFiltroIdClasificacion: '', cboxFiltroIdSubclasificacion: '' }, { emitEvent: false });
    this.actualizarOpcionesTipoEmpleadoPlanta();
    this.recalcularOpcionesCascada();
    this.buscar();
  }

  //AL CAMBIAR EL TIPO DE EMPLEADO PLANTA: LIMPIA CLASIFICACIÓN Y SUBCLASIFICACIÓN, RECALCULA LA CASCADA Y BUSCA:
  cambiarFiltroTipoEmpleadoPlanta(): void {
    this.empleadosForm.patchValue({ cboxFiltroIdClasificacion: '', cboxFiltroIdSubclasificacion: '' }, { emitEvent: false });
    this.recalcularOpcionesCascada();
    this.buscar();
  }

  //AL CAMBIAR LA CLASIFICACIÓN: LIMPIA LA SUBCLASIFICACIÓN, RECALCULA LA CASCADA Y BUSCA:
  cambiarFiltroClasificacion(): void {
    this.empleadosForm.patchValue({ cboxFiltroIdSubclasificacion: '' }, { emitEvent: false });
    this.recalcularOpcionesCascada();
    this.buscar();
  }

  //MÉTODO DE BÚSQUEDA: RESETEA LA PÁGINA A 0 Y REAPLICA LOS FILTROS:
  buscar(): void {
    this.paginaActual = 0;
    this.aplicarFiltros();
  }

  //MÉTODO DE ACCIÓN DE LISTAR — TRAE EL LISTADO COMPLETO DEL BACKEND (EL FILTRADO POR TIPO/CLASIFICACIÓN/SUBCLASIFICACIÓN
  //SE HACE EN EL CLIENTE, YA QUE EL BACKEND SOLO OFRECE "keyword" DE COINCIDENCIA PARCIAL SOBRE CAMPOS PROPIOS):
  accionListar(): void {
    this.empleadosService.findAllEmployees(undefined, undefined, undefined, undefined, undefined, undefined, 'idEmpleado', 'ASC').subscribe({
      next: (data) => {
        this.empleadosCompleto = data;
        this.actualizarOpcionesTipoEmpleadoPlanta();
        this.recalcularOpcionesCascada();
        this.aplicarFiltros();
      },
      error: (err) => console.error('ERROR AL LISTAR EMPLEADOS: ', err)
    });
  }

  //APLICA PALABRA CLAVE + LOS 4 FILTROS EN CASCADA SOBRE EL LISTADO COMPLETO Y PAGINA EL RESULTADO:
  aplicarFiltros(): void {
    const formValues = this.empleadosForm.value;
    const palabraClave = (formValues.ctextPalabraClave || '').trim().toUpperCase();
    const idTipoEmpleado = formValues.cboxFiltroIdTipoEmpleado;
    const idTipoEmpleadoPlanta = formValues.cboxFiltroIdTipoEmpleadoPlanta;
    const idClasificacion = formValues.cboxFiltroIdClasificacion;
    const idSubclasificacion = formValues.cboxFiltroIdSubclasificacion;

    let filtrado = [...this.empleadosCompleto];

    if (palabraClave) {
      filtrado = filtrado.filter(e => {
        const nombreCompleto = `${e.nombresEmpleado} ${e.primerApellidoEmpleado} ${e.segundoApellidoEmpleado || ''}`.toUpperCase();
        return nombreCompleto.includes(palabraClave) ||
          String(e.numeroDocumentoIdentificacionEmpleado || '').toUpperCase().includes(palabraClave) ||
          String(e.movilEmpleado || '').toUpperCase().includes(palabraClave);
      });
    }
    if (idTipoEmpleado) {
      filtrado = filtrado.filter(e => e.tipoEmpleadoDTO?.idTipoEmpleado === Number(idTipoEmpleado));
    }
    if (idTipoEmpleadoPlanta) {
      filtrado = filtrado.filter(e => e.tipoEmpleadoPlantaDTO?.idTipoEmpleadoPlanta === Number(idTipoEmpleadoPlanta));
    }
    if (idClasificacion) {
      filtrado = filtrado.filter(e => e.clasificacionEmpleadoPlantaDTO?.idClasificacionEmpleadoPlanta === Number(idClasificacion));
    }
    if (idSubclasificacion) {
      filtrado = filtrado.filter(e => e.subclasificacionEmpleadoPlantaDTO?.idSubclasificacionEmpleadoPlanta === Number(idSubclasificacion));
    }

    this.totalRegistros = filtrado.length;
    this.totalRegistrosEstadosActivos = filtrado.filter(e => e.estadoEmpleado === 'ACTIVO').length;
    this.totalRegistrosEstadosInactivos = filtrado.filter(e => e.estadoEmpleado === 'INACTIVO').length;

    const inicio = this.paginaActual * this.tandaNumeroRegistrosporPagina;
    this.empleados = filtrado.slice(inicio, inicio + this.tandaNumeroRegistrosporPagina);
  }

  //MÉTODO PARA CALCULAR EL TOTAL DE PÁGINAS:
  calcularTotalPaginas(): number {
    const total = Math.ceil(this.totalRegistros / this.tandaNumeroRegistrosporPagina);
    return total > 0 ? total : 1;
  }

  //MÉTODO PARA CAMBIAR DE PÁGINA:
  cambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
    this.aplicarFiltros();
  }

  //MÉTODO PARA SELECCIONAR TANDA DE REGISTROS POR PÁGINA:
  seleccionarTandaNumeroRegistrosporPagina(): void {
    this.tandaNumeroRegistrosporPagina = Number(this.empleadosForm.value.cboxTandaNumeroRegistrosporPaginaSeleccionado);
    this.paginaActual = 0;
    this.aplicarFiltros();
  }

  //MÉTODO PARA ABRIR EL MODAL DE GUARDAR, MODIFICAR O ELIMINAR:
  OpenModalAddUpdDelEmpleadoComponent(url: string): void {
    const partes = url.split('/');
    this.modalModo = partes[0];
    if (partes.length > 1) {
      const idEmpleado = Number(partes[1]);
      this.empleadoSeleccionado = this.empleados.find(e => e.idEmpleado === idEmpleado) || null;
    } else {
      this.empleadoSeleccionado = null;
    }
    this.modalAddUpdDelVisible = true;
  }

  //MÉTODO PARA ABRIR EL MODAL DE VISTA:
  OpenModalVistaEmpleadoComponent(url: string): void {
    const partes = url.split('/');
    const idEmpleado = Number(partes[partes.length - 1]);
    this.empleadoSeleccionado = this.empleados.find(e => e.idEmpleado === idEmpleado) || null;
    this.modalVistaVisible = true;
  }

  //MÉTODO PARA CERRAR EL MODAL DE ADD-UPD-DEL:
  cerrarModalAddUpdDel(): void {
    this.modalAddUpdDelVisible = false;
    this.empleadoSeleccionado = null;
    this.accionListar();
  }

  //MÉTODO PARA CERRAR EL MODAL DE VISTA:
  cerrarModalVista(): void {
    this.modalVistaVisible = false;
    this.empleadoSeleccionado = null;
  }

  //MÉTODO QUE RECIBE EL TOAST EMITIDO POR LOS COMPONENTES HIJOS:
  recibirToast(evento: { tipo: string; mensaje: string }): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTipo = evento.tipo;
    this.toastMensaje = evento.mensaje;
    this.toastTimer = setTimeout(() => { this.toastMensaje = ''; }, 4000);
  }
}
