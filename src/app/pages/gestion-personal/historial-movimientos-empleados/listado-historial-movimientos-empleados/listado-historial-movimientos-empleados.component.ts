//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

//IMPORTACIÓN DE INTERFACES:
import { HistorialMovimientosEmpleadosI } from '../../../../interfaces/gestion-personal/historial-movimientos-empleados/historialMovimientosEmpleados.interface';

//IMPORTACIÓN DE SERVICIOS:
import { HistorialMovimientosEmpleadosService } from '../../../../services/gestion-personal/historial-movimientos-empleados/historialMovimientosEmpleados.service';
import { SessionService } from '../../../../services/session/session.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-listado-historial-movimientos-empleados',
  templateUrl: './listado-historial-movimientos-empleados.component.html',
  styleUrls: ['./listado-historial-movimientos-empleados.component.scss']
})
export class ListadoHistorialMovimientosEmpleadosComponent implements OnInit {

  //DECLARACIÓN DE VARIABLES GLOBALES:
  isLoggedIn: boolean = false;
  nicknameUsuarioLogueado: string | null = null;

  //CONTROLES DE FORMULARIO — USADOS CON [formControl] DIRECTO:
  ctextPalabraClave = new FormControl('');
  cboxTandaNumeroRegistrosporPaginaSeleccionado = new FormControl('10');

  //SEMÁFORO DE TOTALES:
  totalRegistros: number = 0;

  //PAGINACIÓN:
  paginaActual: number = 0;
  tandaNumeroRegistrosporPagina: number = 10;

  //PRIVILEGIOS Y RESTRICCIONES:
  sioNoPrivilegioyRestriccionAccesoUsuarioCRUDVer: string = 'NO';
  sioNoPrivilegioyRestriccionAccesoUsuarioCRUDGuardar: string = 'NO';
  sioNoPrivilegioyRestriccionAccesoUsuarioCRUDModificar: string = 'NO';
  sioNoPrivilegioyRestriccionAccesoUsuarioCRUDEliminar: string = 'NO';

  //LISTA DE MOVIMIENTOS TRAÍDA DEL BACKEND:
  movimientos: HistorialMovimientosEmpleadosI[] = [];

  //ESTADO DE MODALES:
  modalAddUpdDelVisible: boolean = false;
  modalVistaVisible: boolean = false;
  modalModo: string = '';
  movimientoSeleccionado: HistorialMovimientosEmpleadosI | null = null;

  //TOAST GLOBAL:
  toastMensaje: string = '';
  toastTipo: string = '';
  private toastTimer: any = null;

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
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
    this.accionListar();
    this.actualizarPrivilegiosyRestriccionesCRUD();
  }

  //CONSULTA LOS PRIVILEGIOS Y RESTRICCIONES DE ACCESO REALES DEL USUARIO LOGUEADO Y ACTUALIZA LAS BANDERAS
  //QUE MUESTRAN U OCULTAN LOS BOTONES DE VER/GUARDAR/MODIFICAR/ELIMINAR DE ESTE CRUD:
  private actualizarPrivilegiosyRestriccionesCRUD(): void {
    this.sessionService.cargarPrivilegios().subscribe({
      next: () => {
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDVer = this.sessionService.tieneAcceso('VER HISTORIAL DE MOVIMIENTOS DE EMPLEADOS') ? 'SI' : 'NO';
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDGuardar = this.sessionService.tieneAcceso('GUARDAR HISTORIAL DE MOVIMIENTOS DE EMPLEADOS') ? 'SI' : 'NO';
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDModificar = this.sessionService.tieneAcceso('MODIFICAR HISTORIAL DE MOVIMIENTOS DE EMPLEADOS') ? 'SI' : 'NO';
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDEliminar = this.sessionService.tieneAcceso('ELIMINAR HISTORIAL DE MOVIMIENTOS DE EMPLEADOS') ? 'SI' : 'NO';
      },
      error: (err) => console.error('ERROR AL CARGAR LOS PRIVILEGIOS Y RESTRICCIONES DEL USUARIO: ', err)
    });
  }

  //MÉTODO DE BÚSQUEDA:
  buscar(): void {
    this.paginaActual = 0;
    this.accionListar();
  }

  //MÉTODO DE ACCIÓN DE LISTAR CON PAGINACIÓN REAL DESDE EL BACKEND:
  accionListar(): void {
    const palabraClave = (this.ctextPalabraClave.value || '').trim().toUpperCase();
    const keyword: string | undefined = palabraClave || undefined;

    this.historialMovimientosEmpleadosService.findAllEmployeeMovementHistoriesPag(
      this.paginaActual,
      this.tandaNumeroRegistrosporPagina,
      undefined,
      keyword,
      'idHistorialMovimientoEmpleado',
      'ASC'
    ).subscribe({
      next: (data) => this.movimientos = data,
      error: (err) => console.error('ERROR AL LISTAR MOVIMIENTOS: ', err)
    });

    this.historialMovimientosEmpleadosService.findCountTotalRegisters(undefined, keyword)
      .subscribe({
        next: (n) => this.totalRegistros = n,
        error: (err) => console.error('ERROR AL CONTAR MOVIMIENTOS: ', err)
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
    this.tandaNumeroRegistrosporPagina = Number(this.cboxTandaNumeroRegistrosporPaginaSeleccionado.value);
    this.paginaActual = 0;
    this.accionListar();
  }

  //MÉTODO PARA ABRIR EL MODAL DE GUARDAR, MODIFICAR O ELIMINAR:
  OpenModalAddUpdDelMovimientoComponent(url: string): void {
    const partes = url.split('/');
    this.modalModo = partes[0];
    if (partes.length > 1) {
      const id = Number(partes[1]);
      this.movimientoSeleccionado = this.movimientos.find(m => m.idHistorialMovimientoEmpleado === id) || null;
    } else {
      this.movimientoSeleccionado = null;
    }
    this.modalAddUpdDelVisible = true;
  }

  //MÉTODO PARA ABRIR EL MODAL DE VISTA:
  OpenModalVistaMovimientoComponent(url: string): void {
    const partes = url.split('/');
    const id = Number(partes[partes.length - 1]);
    this.movimientoSeleccionado = this.movimientos.find(m => m.idHistorialMovimientoEmpleado === id) || null;
    this.modalVistaVisible = true;
  }

  //MÉTODO PARA CERRAR EL MODAL DE ADD-UPD-DEL:
  cerrarModalAddUpdDel(): void {
    this.modalAddUpdDelVisible = false;
    this.movimientoSeleccionado = null;
    this.accionListar();
  }

  //MÉTODO PARA CERRAR EL MODAL DE VISTA:
  cerrarModalVista(): void {
    this.modalVistaVisible = false;
    this.movimientoSeleccionado = null;
  }

  //MÉTODO QUE RECIBE EL TOAST EMITIDO POR LOS COMPONENTES HIJOS:
  recibirToast(evento: { tipo: string; mensaje: string }): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTipo = evento.tipo;
    this.toastMensaje = evento.mensaje;
    this.toastTimer = setTimeout(() => { this.toastMensaje = ''; }, 4000);
  }
}
