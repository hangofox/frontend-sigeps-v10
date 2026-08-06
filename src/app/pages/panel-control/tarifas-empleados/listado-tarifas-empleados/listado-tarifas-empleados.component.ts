//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

//IMPORTACIÓN DE INTERFACES:
import { TarifasEmpleadosI } from '../../../../interfaces/panel-control/tarifas-empleados/tarifas-empleados.interface';
import { TiposTarifasEmpleadosI } from '../../../../interfaces/panel-control/tipos-tarifas-empleados/tipos-tarifas-empleados.interface';
import { TipoEmpleadoI } from '../../../../interfaces/tipos-empleados/tipos-empleados.interface';
import { TipoEmpleadoPlantaI } from '../../../../interfaces/tipos-empleados-planta/tipos-empleados-planta.interface';
import { ClasificacionEmpleadoPlantaI } from '../../../../interfaces/clasificaciones-empleados-planta/clasificaciones-empleados-planta.interface';
import { SubclasificacionEmpleadoPlantaI } from '../../../../interfaces/clasificaciones-empleados-planta/subclasificaciones-empleados-planta/subclasificaciones-empleados-planta.interface';

//IMPORTACIÓN DE SERVICIOS:
import { TarifasEmpleadosService } from '../../../../services/panel-control/tarifas-empleados/tarifas-empleados.service';
import { TiposTarifasEmpleadosService } from '../../../../services/panel-control/tipos-tarifas-empleados/tipos-tarifas-empleados.service';
import { TiposEmpleadosService } from '../../../../services/tipos-empleados/tiposEmpleados.service';
import { TiposEmpleadosPlantaService } from '../../../../services/tipos-empleados-planta/tiposEmpleadosPlanta.service';
import { ClasificacionesEmpleadosPlantaService } from '../../../../services/clasificaciones-empleados-planta/clasificacionesEmpleadosPlanta.service';
import { SubclasificacionesEmpleadosPlantaService } from '../../../../services/clasificaciones-empleados-planta/subclasificaciones-empleados-planta/subclasificacionesEmpleadosPlanta.service';
import { SessionService } from '../../../../services/session/session.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-listado-tarifas-empleados',
  templateUrl: './listado-tarifas-empleados.component.html',
  styleUrls: ['./listado-tarifas-empleados.component.scss']
})
export class ListadoTarifasEmpleadosComponent implements OnInit {

  //DECLARACIÓN DE VARIABLES GLOBALES:
  isLoggedIn: boolean = false;
  nicknameUsuarioLogueado: string | null = null;
  tarifasForm!: FormGroup;

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

  //TIPOS DE TARIFA DE EMPLEADO — CARGADOS DESDE EL BACKEND (PARA EL COMBO DE FILTRO):
  tiposTarifasEmpleados: TiposTarifasEmpleadosI[] = [];

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

  //LISTA DE TARIFAS DE EMPLEADOS TRAÍDA DEL BACKEND:
  tarifasEmpleados: TarifasEmpleadosI[] = [];

  //ESTADO DE MODALES:
  modalAddUpdDelVisible: boolean = false;
  modalVistaVisible: boolean = false;
  modalModo: string = '';
  tarifaEmpleadoSeleccionada: TarifasEmpleadosI | null = null;

  //TOAST GLOBAL:
  toastMensaje: string = '';
  toastTipo: string = '';
  private toastTimer: any = null;

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private formBuilder: FormBuilder,
    private tarifasEmpleadosService: TarifasEmpleadosService,
    private tiposTarifasEmpleadosService: TiposTarifasEmpleadosService,
    private tiposEmpleadosService: TiposEmpleadosService,
    private tiposEmpleadosPlantaService: TiposEmpleadosPlantaService,
    private clasificacionesEmpleadosPlantaService: ClasificacionesEmpleadosPlantaService,
    private subclasificacionesEmpleadosPlantaService: SubclasificacionesEmpleadosPlantaService,
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
    this.cargarTiposTarifasEmpleados();
    this.cargarCombosCascada();
    this.accionListar();
    this.actualizarPrivilegiosyRestriccionesCRUD();
  }

  //CONSULTA LOS PRIVILEGIOS Y RESTRICCIONES DE ACCESO REALES DEL USUARIO LOGUEADO Y ACTUALIZA LAS BANDERAS
  //QUE MUESTRAN U OCULTAN LOS BOTONES DE VER/GUARDAR/MODIFICAR/ELIMINAR DE ESTE CRUD:
  private actualizarPrivilegiosyRestriccionesCRUD(): void {
    this.sessionService.cargarPrivilegios().subscribe({
      next: () => {
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDVer = this.sessionService.tieneAcceso('VER TARIFAS DE EMPLEADOS') ? 'SI' : 'NO';
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDGuardar = this.sessionService.tieneAcceso('GUARDAR TARIFAS DE EMPLEADOS') ? 'SI' : 'NO';
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDModificar = this.sessionService.tieneAcceso('MODIFICAR TARIFAS DE EMPLEADOS') ? 'SI' : 'NO';
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDEliminar = this.sessionService.tieneAcceso('ELIMINAR TARIFAS DE EMPLEADOS') ? 'SI' : 'NO';
      },
      error: (err) => console.error('ERROR AL CARGAR LOS PRIVILEGIOS Y RESTRICCIONES DEL USUARIO: ', err)
    });
  }

  //MÉTODO DE INICIALIZACIÓN DEL FORMULARIO:
  initForm(): void {
    this.tarifasForm = this.formBuilder.group({
      ctextPalabraClave: new FormControl(''),
      cboxFiltroIdTipoEmpleado: new FormControl(''),
      cboxFiltroIdTipoEmpleadoPlanta: new FormControl(''),
      cboxFiltroIdClasificacion: new FormControl(''),
      cboxFiltroIdSubclasificacion: new FormControl(''),
      cboxTipoTarifaEmpleadoSeleccionado: new FormControl(''),
      ctextAnioTarifaEmpleado: new FormControl(''),
      cboxTandaNumeroRegistrosporPaginaSeleccionado: new FormControl('10')
    });
  }

  //MÉTODO QUE CARGA LOS TIPOS DE TARIFA DE EMPLEADO DESDE EL BACKEND (PARA EL COMBO DE FILTRO):
  cargarTiposTarifasEmpleados(): void {
    this.tiposTarifasEmpleadosService.findAllEmployeeRateTypes(undefined, undefined, undefined, 'nombreTipoTarifaEmpleado', 'ASC')
      .subscribe({
        next: (tipos) => { this.tiposTarifasEmpleados = tipos; },
        error: (err) => console.error('ERROR AL CARGAR TIPOS DE TARIFAS DE EMPLEADOS: ', err)
      });
  }

  //CARGA LOS CATÁLOGOS COMPLETOS DE TIPO DE EMPLEADO, TIPO DE EMPLEADO PLANTA, CLASIFICACIÓN Y SUBCLASIFICACIÓN (PARA LOS COMBOS DE FILTRO EN CASCADA):
  cargarCombosCascada(): void {
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
  }

  //REGLA DE NEGOCIO: EL COMBO DE TIPO DE EMPLEADO PLANTA SOLO APLICA CUANDO EL TIPO DE EMPLEADO SELECCIONADO ES "PLANTA",
  //Y EN ESE CASO SOLO SE DESPLIEGAN LAS OPCIONES "ADMINISTRATIVO", "OPERATIVO" Y "NO APLICA" DEL CATÁLOGO. PARA CUALQUIER OTRO
  //TIPO DE EMPLEADO (O NINGUNO SELECCIONADO), EL COMBO SE RESETEA Y QUEDA SIN OPCIONES:
  actualizarOpcionesTipoEmpleadoPlanta(): void {
    const idTipoEmpleado = this.tarifasForm.value.cboxFiltroIdTipoEmpleado;
    const tipoEmpleadoSeleccionado = this.opcionesTiposEmpleados.find(t => t.idTipoEmpleado === Number(idTipoEmpleado));
    const esTipoEmpleadoPlanta = String(tipoEmpleadoSeleccionado?.nombreTipoEmpleado || '').toUpperCase() === 'PLANTA';

    this.opcionesTiposEmpleadosPlanta = esTipoEmpleadoPlanta
      ? this.tiposEmpleadosPlantaCompleto.filter(t => ['ADMINISTRATIVO', 'OPERATIVO', 'NO APLICA'].includes(String(t.nombreTipoEmpleadoPlanta).toUpperCase()))
      : [];
  }

  //RECALCULA LAS OPCIONES DE CLASIFICACIÓN Y SUBCLASIFICACIÓN FILTRANDO LOS CATÁLOGOS COMPLETOS POR LA RELACIÓN
  //PADRE-HIJO REAL DECLARADA EN EL BACKEND (Clasificación.tipoEmpleadoPlantaDTO Y Subclasificación.clasificacionEmpleadoPlantaDTO):
  recalcularOpcionesCascada(): void {
    const fv = this.tarifasForm.value;
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
    this.tarifasForm.patchValue({ cboxFiltroIdTipoEmpleadoPlanta: '', cboxFiltroIdClasificacion: '', cboxFiltroIdSubclasificacion: '' }, { emitEvent: false });
    this.actualizarOpcionesTipoEmpleadoPlanta();
    this.recalcularOpcionesCascada();
    this.buscar();
  }

  //AL CAMBIAR EL TIPO DE EMPLEADO PLANTA: LIMPIA CLASIFICACIÓN Y SUBCLASIFICACIÓN, RECALCULA LA CASCADA Y BUSCA:
  cambiarFiltroTipoEmpleadoPlanta(): void {
    this.tarifasForm.patchValue({ cboxFiltroIdClasificacion: '', cboxFiltroIdSubclasificacion: '' }, { emitEvent: false });
    this.recalcularOpcionesCascada();
    this.buscar();
  }

  //AL CAMBIAR LA CLASIFICACIÓN: LIMPIA LA SUBCLASIFICACIÓN, RECALCULA LA CASCADA Y BUSCA:
  cambiarFiltroClasificacion(): void {
    this.tarifasForm.patchValue({ cboxFiltroIdSubclasificacion: '' }, { emitEvent: false });
    this.recalcularOpcionesCascada();
    this.buscar();
  }

  //MÉTODO DE BÚSQUEDA: RESETEA LA PÁGINA A 0 Y LLAMA EL LISTADO:
  buscar(): void {
    this.paginaActual = 0;
    this.accionListar();
  }

  //MÉTODO DE ACCIÓN DE LISTAR CON PAGINACIÓN REAL DESDE EL BACKEND:
  accionListar(): void {
    const formValues = this.tarifasForm.value;
    const palabraClave = (formValues.ctextPalabraClave || '').trim().toUpperCase();
    const keyword: string | undefined = palabraClave || undefined;
    const idTipoEmpleado: number | undefined = formValues.cboxFiltroIdTipoEmpleado ? Number(formValues.cboxFiltroIdTipoEmpleado) : undefined;
    const idTipoEmpleadoPlanta: number | undefined = formValues.cboxFiltroIdTipoEmpleadoPlanta ? Number(formValues.cboxFiltroIdTipoEmpleadoPlanta) : undefined;
    const idClasificacionEmpleadoPlanta: number | undefined = formValues.cboxFiltroIdClasificacion ? Number(formValues.cboxFiltroIdClasificacion) : undefined;
    const idSubclasificacionEmpleadoPlanta: number | undefined = formValues.cboxFiltroIdSubclasificacion ? Number(formValues.cboxFiltroIdSubclasificacion) : undefined;
    const idTipoTarifaEmpleado: number | undefined = formValues.cboxTipoTarifaEmpleadoSeleccionado ? Number(formValues.cboxTipoTarifaEmpleadoSeleccionado) : undefined;
    const anioTarifaEmpleado: number | undefined = formValues.ctextAnioTarifaEmpleado ? Number(formValues.ctextAnioTarifaEmpleado) : undefined;

    //LISTADO PAGINADO:
    this.tarifasEmpleadosService.findAllEmployeeRatesPag(
      this.paginaActual,
      this.tandaNumeroRegistrosporPagina,
      undefined,
      keyword,
      idTipoEmpleado,
      idTipoEmpleadoPlanta,
      idClasificacionEmpleadoPlanta,
      idSubclasificacionEmpleadoPlanta,
      idTipoTarifaEmpleado,
      anioTarifaEmpleado,
      undefined,
      'idTarifaEmpleado',
      'ASC'
    ).subscribe({
      next: (data) => this.tarifasEmpleados = data,
      error: (err) => console.error('ERROR AL LISTAR TARIFAS DE EMPLEADOS: ', err)
    });

    //CONTADOR TOTAL FILTRADO (BASE PARA PAGINACIÓN):
    this.tarifasEmpleadosService.findCountTotalRegisters(undefined, keyword, idTipoEmpleado, idTipoEmpleadoPlanta, idClasificacionEmpleadoPlanta, idSubclasificacionEmpleadoPlanta, idTipoTarifaEmpleado, anioTarifaEmpleado)
      .subscribe({
        next: (n) => this.totalRegistros = n,
        error: (err) => console.error('ERROR AL CONTAR TOTAL TARIFAS DE EMPLEADOS: ', err)
      });

    //SEMÁFORO: total global → inactivos → activos derivado:
    this.tarifasEmpleadosService.findCountTotalRegisters()
      .subscribe({
        next: (total) => {
          this.tarifasEmpleadosService.findCountTotalRegisters(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'INACTIVO')
            .subscribe({
              next: (inactivos) => {
                this.totalRegistrosEstadosInactivos = inactivos;
                this.totalRegistrosEstadosActivos = total - inactivos;
              },
              error: (err) => console.error('ERROR AL CONTAR TARIFAS DE EMPLEADOS INACTIVAS: ', err)
            });
        },
        error: (err) => console.error('ERROR AL CONTAR TOTAL SEMÁFORO: ', err)
      });
  }

  //MÉTODO PARA CALCULAR EL TOTAL DE PÁGINAS:
  calcularTotalPaginas(): number {
    const total = Math.ceil(this.totalRegistros / this.tandaNumeroRegistrosporPagina);
    return total > 0 ? total : 1;
  }

  //MÉTODO PARA CAMBIAR DE PÁGINA:
  cambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
    this.accionListar();
  }

  //MÉTODO PARA SELECCIONAR TANDA DE REGISTROS POR PÁGINA:
  seleccionarTandaNumeroRegistrosporPagina(): void {
    this.tandaNumeroRegistrosporPagina = Number(this.tarifasForm.value.cboxTandaNumeroRegistrosporPaginaSeleccionado);
    this.paginaActual = 0;
    this.accionListar();
  }

  //MÉTODO PARA ABRIR EL MODAL DE GUARDAR, MODIFICAR O ELIMINAR:
  OpenModalAddUpdDelTarifaEmpleadoComponent(url: string): void {
    const partes = url.split('/');
    this.modalModo = partes[0];
    if (partes.length > 1) {
      const idTarifaEmpleado = Number(partes[1]);
      this.tarifaEmpleadoSeleccionada = this.tarifasEmpleados.find(t => t.idTarifaEmpleado === idTarifaEmpleado) || null;
    } else {
      this.tarifaEmpleadoSeleccionada = null;
    }
    this.modalAddUpdDelVisible = true;
  }

  //MÉTODO PARA ABRIR EL MODAL DE VISTA:
  OpenModalVistaTarifaEmpleadoComponent(url: string): void {
    const partes = url.split('/');
    const idTarifaEmpleado = Number(partes[partes.length - 1]);
    this.tarifaEmpleadoSeleccionada = this.tarifasEmpleados.find(t => t.idTarifaEmpleado === idTarifaEmpleado) || null;
    this.modalVistaVisible = true;
  }

  //MÉTODO PARA CERRAR EL MODAL DE ADD-UPD-DEL:
  cerrarModalAddUpdDel(): void {
    this.modalAddUpdDelVisible = false;
    this.tarifaEmpleadoSeleccionada = null;
    this.accionListar();
  }

  //MÉTODO PARA CERRAR EL MODAL DE VISTA:
  cerrarModalVista(): void {
    this.modalVistaVisible = false;
    this.tarifaEmpleadoSeleccionada = null;
  }

  //MÉTODO QUE RECIBE EL TOAST EMITIDO POR LOS COMPONENTES HIJOS:
  recibirToast(evento: { tipo: string; mensaje: string }): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTipo = evento.tipo;
    this.toastMensaje = evento.mensaje;
    this.toastTimer = setTimeout(() => { this.toastMensaje = ''; }, 4000);
  }
}
