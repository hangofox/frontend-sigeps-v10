//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

//IMPORTACIÓN DE INTERFACES:
import { AuditoriaSistemaI } from '../../../../interfaces/panel-control/auditorias-sistema/auditoria-sistema.interface';

//IMPORTACIÓN DE SERVICIOS:
import { AuditoriasSistemaService } from '../../../../services/panel-control/auditorias-sistema/auditorias-sistema.service';
import { SessionService } from '../../../../services/session/session.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-listado-auditorias-sistema',
  templateUrl: './listado-auditorias-sistema.component.html',
  styleUrls: ['./listado-auditorias-sistema.component.scss']
})
export class ListadoAuditoriasSistemaComponent implements OnInit {

  //DECLARACIÓN DE VARIABLES GLOBALES:
  isLoggedIn: boolean = false;
  nicknameUsuarioLogueado: string | null = null;

  //CONTROLES DE FORMULARIO — USADOS CON [formControl] DIRECTO:
  ctextPalabraClave = new FormControl('');
  cboxTandaNumeroRegistrosporPaginaSeleccionado = new FormControl('10');

  //LISTA DE AUDITORÍAS:
  auditorias: AuditoriaSistemaI[] = [];

  //SEMÁFORO DE ESTADOS — CONTADORES:
  totalRegistros: number = 0;
  cargandoDatos: boolean = false;

  //PAGINACIÓN:
  paginaActual: number = 0;
  tandaNumeroRegistrosporPagina: number = 10;

  //PRIVILEGIOS Y RESTRICCIONES:
  sioNoPrivilegioyRestriccionAccesoUsuarioCRUDVer: string = 'NO';
  sioNoPrivilegioyRestriccionAccesoUsuarioCRUDEliminar: string = 'NO';

  //ESTADO DE MODALES:
  modalAddUpdDelVisible: boolean = false;
  modalVistaVisible: boolean = false;
  modalModo: string = '';
  auditoriaSeleccionada: AuditoriaSistemaI | null = null;

  //TOAST:
  toastMensaje: string = '';
  toastTipo: string = '';
  private toastTimer: any = null;

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private auditoriasSistemaService: AuditoriasSistemaService,
    private sessionService: SessionService
  ) {}

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      this.isLoggedIn = true;
      this.nicknameUsuarioLogueado = localStorage.getItem('nicknameUsuarioLogueado');
    }
    this.actualizarPrivilegiosyRestriccionesCRUD();
    this.accionListar();
  }

  //CONSULTA LOS PRIVILEGIOS Y RESTRICCIONES DE ACCESO REALES DEL USUARIO LOGUEADO Y ACTUALIZA LAS BANDERAS
  //QUE MUESTRAN U OCULTAN LOS BOTONES DE VER/ELIMINAR DE ESTE CRUD:
  private actualizarPrivilegiosyRestriccionesCRUD(): void {
    this.sessionService.cargarPrivilegios().subscribe({
      next: () => {
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDVer = this.sessionService.tieneAcceso('VER AUDITORIAS DEL SISTEMA') ? 'SI' : 'NO';
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDEliminar = this.sessionService.tieneAcceso('ELIMINAR AUDITORIAS DEL SISTEMA') ? 'SI' : 'NO';
      },
      error: (err) => console.error('ERROR AL CARGAR LOS PRIVILEGIOS Y RESTRICCIONES DEL USUARIO: ', err)
    });
  }

  //MÉTODO DE ACCIÓN DE LISTAR — CONECTADO AL BACKEND:
  accionListar(): void {
    const keyword = (this.ctextPalabraClave.value || '').trim();

    this.cargandoDatos = true;
    this.auditoriasSistemaService.findCountTotalRegisters(undefined, keyword).subscribe({
      next: (total) => { this.totalRegistros = total; },
      error: () => { this.totalRegistros = 0; }
    });

    //ORDENADO POR fechaHMSAuditoriaSistema DESCENDENTE PARA QUE LA AUDITORÍA MÁS RECIENTE APAREZCA PRIMERO:
    this.auditoriasSistemaService.findAllSystemAuditsPag(
      this.paginaActual,
      this.tandaNumeroRegistrosporPagina,
      undefined,
      keyword,
      'fechaHMSAuditoriaSistema',
      'DESC'
    ).subscribe({
      next: (datos) => {
        this.auditorias = datos;
        this.cargandoDatos = false;
      },
      error: (err) => {
        console.error('ERROR AL LISTAR AUDITORÍAS DEL SISTEMA: ', err);
        this.auditorias = [];
        this.cargandoDatos = false;
      }
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

  //MÉTODO PARA LIMPIAR LOS FILTROS:
  limpiarFiltros(): void {
    this.ctextPalabraClave.setValue('');
    this.paginaActual = 0;
    this.accionListar();
  }

  //MÉTODO PARA ABRIR EL MODAL DE ELIMINAR:
  OpenModalAddUpdDelAuditoriaSistemaComponent(url: string): void {
    const partes = url.split('/');
    this.modalModo = partes[0];
    const id = partes[1] ? Number(partes[1]) : null;
    if (id !== null) {
      this.auditoriaSeleccionada = this.auditorias.find(a => a.idAuditoriaSistema === id) || null;
    } else {
      this.auditoriaSeleccionada = null;
    }
    this.modalAddUpdDelVisible = true;
  }

  //MÉTODO PARA ABRIR EL MODAL DE VISTA:
  OpenModalVistaAuditoriaSistemaComponent(id: number): void {
    this.auditoriaSeleccionada = this.auditorias.find(a => a.idAuditoriaSistema === id) || null;
    this.modalVistaVisible = true;
  }

  //MÉTODO PARA CERRAR EL MODAL ADD/UPD/DEL:
  cerrarModalAddUpdDel(): void {
    this.modalAddUpdDelVisible = false;
    this.auditoriaSeleccionada = null;
    this.accionListar();
  }

  //MÉTODO PARA CERRAR EL MODAL DE VISTA:
  cerrarModalVista(): void {
    this.modalVistaVisible = false;
    this.auditoriaSeleccionada = null;
  }

  //RECIBE EL TOAST EMITIDO POR EL COMPONENTE HIJO:
  recibirToast(evento: { tipo: string; mensaje: string }): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTipo = evento.tipo;
    this.toastMensaje = evento.mensaje;
    this.toastTimer = setTimeout(() => { this.toastMensaje = ''; }, 4000);
  }

  //MÉTODO PARA OBTENER LA CLASE CSS DEL BADGE DE ACCIÓN:
  getBadgeAccion(accion: string): string {
    const mapa: { [key: string]: string } = {
      'GUARDAR': 'badge-guardar', 'MODIFICAR': 'badge-modificar',
      'ELIMINAR': 'badge-eliminar-accion', 'CONSULTAR': 'badge-consultar',
      'LOGIN': 'badge-login', 'LOGOUT': 'badge-logout'
    };
    return mapa[String(accion).toUpperCase()] || '';
  }
}
