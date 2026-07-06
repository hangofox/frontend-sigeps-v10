//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

//IMPORTACIÓN DE INTERFACES:
import { ProgramacionTurnoEmpleadoI } from '../../../../interfaces/gestion-personal/programaciones-turnos-empleados/programaciones-turnos-empleados.interface';
import { TurnosI } from '../../../../interfaces/panel-control/turnos/turnos.interface';

//IMPORTACIÓN DE SERVICIOS:
import { ProgramacionesTurnosEmpleadosService } from '../../../../services/gestion-personal/programaciones-turnos-empleados/programacionesTurnosEmpleados.service';
import { TurnosService } from '../../../../services/panel-control/turnos/turnos.service';
import { SessionService } from '../../../../services/session/session.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-listado-prog-turnos-empleados',
  templateUrl: './listado-prog-turnos-empleados.component.html',
  styleUrls: ['./listado-prog-turnos-empleados.component.scss']
})
export class ListadoProgTurnosEmpleadosComponent implements OnInit {

  //DECLARACIÓN DE VARIABLES GLOBALES:
  isLoggedIn: boolean = false;
  nicknameUsuarioLogueado: string | null = null;
  programacionesForm!: FormGroup;

  //SEMÁFORO DE ESTADOS — CONTADORES:
  totalRegistros: number = 0;
  totalRegistrosEstadosActivos: number = 0;
  totalRegistrosEstadosFinalizados: number = 0;

  //PAGINACIÓN:
  paginaActual: number = 0;
  tandaNumeroRegistrosporPagina: number = 10;

  //PRIVILEGIOS Y RESTRICCIONES DE ACCESO DEL USUARIO — SE ACTUALIZAN EN ngOnInit CON LOS PRIVILEGIOS Y RESTRICCIONES REALES:
  sioNoPrivilegioyRestriccionAccesoUsuarioCRUDVer: string = 'NO';
  sioNoPrivilegioyRestriccionAccesoUsuarioCRUDGuardar: string = 'NO';
  sioNoPrivilegioyRestriccionAccesoUsuarioCRUDModificar: string = 'NO';
  sioNoPrivilegioyRestriccionAccesoUsuarioCRUDEliminar: string = 'NO';

  //OPCIONES DE FILTROS:
  opcionesTurno: TurnosI[] = [];
  opcionesEstado: string[] = ['ACTIVO', 'FINALIZADO'];

  //LISTA COMPLETA TRAÍDA DEL BACKEND Y LISTA YA FILTRADA/PAGINADA QUE SE MUESTRA EN PANTALLA:
  private programacionesCompleto: ProgramacionTurnoEmpleadoI[] = [];
  programaciones: ProgramacionTurnoEmpleadoI[] = [];

  //ESTADO DE MODALES:
  modalAddUpdDelVisible: boolean = false;
  modalVistaVisible: boolean = false;
  modalModo: string = '';
  programacionSeleccionada: ProgramacionTurnoEmpleadoI | null = null;

  //TOAST GLOBAL:
  toastMensaje: string = '';
  toastTipo: string = '';
  private toastTimer: any = null;

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private formBuilder: FormBuilder,
    private programacionesTurnosEmpleadosService: ProgramacionesTurnosEmpleadosService,
    private turnosService: TurnosService,
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
    this.cargarOpcionesTurno();
    this.accionListar();
    this.actualizarPrivilegiosyRestriccionesCRUD();
  }

  //CONSULTA LOS PRIVILEGIOS Y RESTRICCIONES DE ACCESO REALES DEL USUARIO LOGUEADO Y ACTUALIZA LAS BANDERAS
  //QUE MUESTRAN U OCULTAN LOS BOTONES DE VER/GUARDAR/MODIFICAR/ELIMINAR DE ESTE CRUD:
  private actualizarPrivilegiosyRestriccionesCRUD(): void {
    this.sessionService.cargarPrivilegios().subscribe({
      next: () => {
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDVer = this.sessionService.tieneAcceso('VER PROGRAMACIONES DE TURNOS DE EMPLEADOS') ? 'SI' : 'NO';
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDGuardar = this.sessionService.tieneAcceso('GUARDAR PROGRAMACIONES DE TURNOS DE EMPLEADOS') ? 'SI' : 'NO';
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDModificar = this.sessionService.tieneAcceso('MODIFICAR PROGRAMACIONES DE TURNOS DE EMPLEADOS') ? 'SI' : 'NO';
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDEliminar = this.sessionService.tieneAcceso('ELIMINAR PROGRAMACIONES DE TURNOS DE EMPLEADOS') ? 'SI' : 'NO';
      },
      error: (err) => console.error('ERROR AL CARGAR LOS PRIVILEGIOS Y RESTRICCIONES DEL USUARIO: ', err)
    });
  }

  //MÉTODO DE INICIALIZACIÓN DEL FORMULARIO:
  initForm(): void {
    this.programacionesForm = this.formBuilder.group({
      ctextPalabraClave: new FormControl(''),
      cboxFiltroTurno: new FormControl(''),
      cboxFiltroEstado: new FormControl(''),
      cboxTandaNumeroRegistrosporPaginaSeleccionado: new FormControl('10')
    });
  }

  //CARGA LOS TURNOS DISPONIBLES DESDE EL BACKEND PARA EL COMBO DE FILTRO:
  cargarOpcionesTurno(): void {
    this.turnosService.findAllShifts(undefined, undefined, 'nombreTurno', 'ASC').subscribe({
      next: (data) => { this.opcionesTurno = data; },
      error: (err) => console.error('ERROR AL CARGAR TURNOS: ', err)
    });
  }

  //MÉTODO DE ACCIÓN DE LISTAR — EL BACKEND SOLO OFRECE "keyword" DE COINCIDENCIA PARCIAL SOBRE CAMPOS PROPIOS,
  //ASÍ QUE SE TRAE EL LISTADO COMPLETO Y SE FILTRA (PALABRA CLAVE, TURNO, ESTADO) Y PAGINA EN EL CLIENTE:
  accionListar(): void {
    this.programacionesTurnosEmpleadosService.findAllEmployeeShiftSchedules(undefined, undefined, 'idProgramacionTurnoEmpleado', 'ASC').subscribe({
      next: (data) => {
        this.programacionesCompleto = data;
        this.aplicarFiltros();
      },
      error: (err) => console.error('ERROR AL LISTAR PROGRAMACIONES DE TURNOS: ', err)
    });
  }

  //APLICA LOS FILTROS DE PALABRA CLAVE, TURNO Y ESTADO SOBRE EL LISTADO COMPLETO Y PAGINA EL RESULTADO:
  aplicarFiltros(): void {
    const formValues = this.programacionesForm.value;
    const palabraClave = (formValues.ctextPalabraClave || '').trim().toUpperCase();
    const filtroTurno = formValues.cboxFiltroTurno;
    const filtroEstado = formValues.cboxFiltroEstado;

    let filtrado = [...this.programacionesCompleto];

    if (palabraClave) {
      filtrado = filtrado.filter(p => {
        const emp = p.empleadoDTO;
        const puesto = p.puestoSedeEstablecimientoClienteDTO;
        const nombreCompleto = `${emp?.nombresEmpleado || ''} ${emp?.primerApellidoEmpleado || ''} ${emp?.segundoApellidoEmpleado || ''}`.toUpperCase();
        return nombreCompleto.includes(palabraClave) ||
          String(emp?.numeroDocumentoIdentificacionEmpleado || '').toUpperCase().includes(palabraClave) ||
          String(puesto?.nombrePuestoSedeEstablecimientoCliente || '').toUpperCase().includes(palabraClave) ||
          String(puesto?.sedeEstablecimientoClienteDTO?.nombreSedeEstablecimientoCliente || '').toUpperCase().includes(palabraClave) ||
          String(p.turnoDTO?.nombreTurno || '').toUpperCase().includes(palabraClave);
      });
    }
    if (filtroTurno) {
      filtrado = filtrado.filter(p => p.turnoDTO?.nombreTurno === filtroTurno);
    }
    if (filtroEstado) {
      filtrado = filtrado.filter(p => p.estadoProgramacionTurnoEmpleado === filtroEstado);
    }

    this.totalRegistros = filtrado.length;
    this.totalRegistrosEstadosActivos = filtrado.filter(p => p.estadoProgramacionTurnoEmpleado === 'ACTIVO').length;
    this.totalRegistrosEstadosFinalizados = filtrado.filter(p => p.estadoProgramacionTurnoEmpleado === 'FINALIZADO').length;

    const inicio = this.paginaActual * this.tandaNumeroRegistrosporPagina;
    this.programaciones = filtrado.slice(inicio, inicio + this.tandaNumeroRegistrosporPagina);
  }

  //MÉTODO DE BÚSQUEDA: RESETEA LA PÁGINA A 0 Y REAPLICA LOS FILTROS:
  buscar(): void {
    this.paginaActual = 0;
    this.aplicarFiltros();
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
    const formValues = this.programacionesForm.value;
    this.tandaNumeroRegistrosporPagina = Number(formValues.cboxTandaNumeroRegistrosporPaginaSeleccionado);
    this.paginaActual = 0;
    this.aplicarFiltros();
  }

  //MÉTODO PARA ABRIR EL MODAL DE GUARDAR, MODIFICAR O ELIMINAR:
  OpenModalAddUpdDelProgramacionComponent(url: string): void {
    const partes = url.split('/');
    this.modalModo = partes[0];
    if (partes.length > 1) {
      const id = Number(partes[1]);
      this.programacionSeleccionada = this.programaciones.find(p => p.idProgramacionTurnoEmpleado === id) || null;
    } else {
      this.programacionSeleccionada = null;
    }
    this.modalAddUpdDelVisible = true;
  }

  //MÉTODO PARA ABRIR EL MODAL DE VISTA:
  OpenModalVistaProgramacionComponent(url: string): void {
    const partes = url.split('/');
    const id = Number(partes[partes.length - 1]);
    this.programacionSeleccionada = this.programaciones.find(p => p.idProgramacionTurnoEmpleado === id) || null;
    this.modalVistaVisible = true;
  }

  //MÉTODO PARA CERRAR EL MODAL DE ADD-UPD-DEL:
  cerrarModalAddUpdDel(): void {
    this.modalAddUpdDelVisible = false;
    this.programacionSeleccionada = null;
    this.accionListar();
  }

  //MÉTODO PARA CERRAR EL MODAL DE VISTA:
  cerrarModalVista(): void {
    this.modalVistaVisible = false;
    this.programacionSeleccionada = null;
  }

  //MÉTODO QUE RECIBE EL TOAST EMITIDO POR LOS COMPONENTES HIJOS:
  recibirToast(evento: { tipo: string; mensaje: string }): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTipo = evento.tipo;
    this.toastMensaje = evento.mensaje;
    this.toastTimer = setTimeout(() => { this.toastMensaje = ''; }, 4000);
  }
}
