//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

//IMPORTACIÓN DE INTERFACES:
import { EstablecimientoClienteI } from '../../../../interfaces/panel-control/gestion-establecimientos-clientes/establecimientos-clientes.interface';

//IMPORTACIÓN DE SERVICIOS:
import { EstablecimientosClientesService } from '../../../../services/panel-control/gestion-establecimientos-clientes/establecimientosClientes.service';
import { SessionService } from '../../../../services/session/session.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-listado-establecimientos-clientes',
  templateUrl: './listado-establecimientos-clientes.component.html',
  styleUrls: ['./listado-establecimientos-clientes.component.scss']
})
export class ListadoEstablecimientosClientesComponent implements OnInit {

  //DECLARACIÓN DE VARIABLES GLOBALES:
  isLoggedIn: boolean = false;
  nicknameUsuarioLogueado: string | null = null;
  establecimientosForm!: FormGroup;

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

  //LISTA DE ESTABLECIMIENTOS TRAÍDA DEL BACKEND:
  establecimientos: EstablecimientoClienteI[] = [];

  //ESTADO DE MODALES:
  modalAddUpdDelVisible: boolean = false;
  modalVistaVisible: boolean = false;
  modalSedesVisible: boolean = false;
  modalModo: string = '';
  establecimientoSeleccionado: EstablecimientoClienteI | null = null;

  //TOAST GLOBAL:
  toastMensaje: string = '';
  toastTipo: string = '';
  private toastTimer: any = null;

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private formBuilder: FormBuilder,
    private establecimientosClientesService: EstablecimientosClientesService,
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
    this.accionListar();
    this.actualizarPrivilegiosyRestriccionesCRUD();
  }

  //CONSULTA LOS PRIVILEGIOS Y RESTRICCIONES DE ACCESO REALES DEL USUARIO LOGUEADO Y ACTUALIZA LAS BANDERAS
  //QUE MUESTRAN U OCULTAN LOS BOTONES DE VER/GUARDAR/MODIFICAR/ELIMINAR DE ESTE CRUD:
  private actualizarPrivilegiosyRestriccionesCRUD(): void {
    this.sessionService.cargarPrivilegios().subscribe({
      next: () => {
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDVer = this.sessionService.tieneAcceso('VER ESTABLECIMIENTOS DE CLIENTES') ? 'SI' : 'NO';
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDGuardar = this.sessionService.tieneAcceso('GUARDAR ESTABLECIMIENTOS DE CLIENTES') ? 'SI' : 'NO';
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDModificar = this.sessionService.tieneAcceso('MODIFICAR ESTABLECIMIENTOS DE CLIENTES') ? 'SI' : 'NO';
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDEliminar = this.sessionService.tieneAcceso('ELIMINAR ESTABLECIMIENTOS DE CLIENTES') ? 'SI' : 'NO';
      },
      error: (err) => console.error('ERROR AL CARGAR LOS PRIVILEGIOS Y RESTRICCIONES DEL USUARIO: ', err)
    });
  }

  //MÉTODO DE INICIALIZACIÓN DEL FORMULARIO:
  initForm(): void {
    this.establecimientosForm = this.formBuilder.group({
      ctextPalabraClave: new FormControl(''),
      cboxTandaNumeroRegistrosporPaginaSeleccionado: new FormControl('10')
    });
  }

  //MÉTODO DE BÚSQUEDA: RESETEA LA PÁGINA A 0 Y LLAMA EL LISTADO:
  buscar(): void {
    this.paginaActual = 0;
    this.accionListar();
  }

  //MÉTODO DE ACCIÓN DE LISTAR CON PAGINACIÓN REAL DESDE EL BACKEND:
  accionListar(): void {
    const formValues = this.establecimientosForm.value;
    const palabraClave = (formValues.ctextPalabraClave || '').trim().toUpperCase();
    const keyword: string | undefined = palabraClave || undefined;

    //LISTADO PAGINADO:
    this.establecimientosClientesService.findAllClientEstablishmentsPag(
      this.paginaActual,
      this.tandaNumeroRegistrosporPagina,
      undefined,
      keyword,
      'idEstablecimientoCliente',
      'ASC'
    ).subscribe({
      next: (data) => this.establecimientos = data,
      error: (err) => console.error('ERROR AL LISTAR ESTABLECIMIENTOS: ', err)
    });

    //CONTADOR TOTAL FILTRADO (BASE PARA PAGINACIÓN):
    this.establecimientosClientesService.findCountTotalRegisters(undefined, keyword)
      .subscribe({
        next: (n) => this.totalRegistros = n,
        error: (err) => console.error('ERROR AL CONTAR TOTAL ESTABLECIMIENTOS: ', err)
      });

    //SEMÁFORO: total global → inactivos por keyword → activos derivado:
    this.establecimientosClientesService.findCountTotalRegisters()
      .subscribe({
        next: (total) => {
          this.establecimientosClientesService.findCountTotalRegisters(undefined, 'INACTIVO')
            .subscribe({
              next: (inactivos) => {
                this.totalRegistrosEstadosInactivos = inactivos;
                this.totalRegistrosEstadosActivos = total - inactivos;
              },
              error: (err) => console.error('ERROR AL CONTAR ESTABLECIMIENTOS INACTIVOS: ', err)
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
    this.tandaNumeroRegistrosporPagina = Number(this.establecimientosForm.value.cboxTandaNumeroRegistrosporPaginaSeleccionado);
    this.paginaActual = 0;
    this.accionListar();
  }

  //MÉTODO PARA ABRIR EL MODAL DE GUARDAR, MODIFICAR O ELIMINAR:
  OpenModalAddUpdDelEstablecimientoClienteComponent(url: string): void {
    const partes = url.split('/');
    this.modalModo = partes[0];
    if (partes.length > 1) {
      const id = Number(partes[1]);
      this.establecimientoSeleccionado = this.establecimientos.find(e => e.idEstablecimientoCliente === id) || null;
    } else {
      this.establecimientoSeleccionado = null;
    }
    this.modalAddUpdDelVisible = true;
  }

  //MÉTODO PARA ABRIR EL MODAL DE VISTA:
  OpenModalVistaEstablecimientoClienteComponent(url: string): void {
    const partes = url.split('/');
    const id = Number(partes[partes.length - 1]);
    this.establecimientoSeleccionado = this.establecimientos.find(e => e.idEstablecimientoCliente === id) || null;
    this.modalVistaVisible = true;
  }

  //MÉTODO PARA ABRIR EL MODAL DE SEDES:
  OpenModalSedesEstablecimientoClienteComponent(id: number): void {
    this.establecimientoSeleccionado = this.establecimientos.find(e => e.idEstablecimientoCliente === id) || null;
    this.modalSedesVisible = true;
  }

  //MÉTODO PARA CERRAR EL MODAL DE ADD-UPD-DEL:
  cerrarModalAddUpdDel(): void {
    this.modalAddUpdDelVisible = false;
    this.establecimientoSeleccionado = null;
    this.accionListar();
  }

  //MÉTODO PARA CERRAR EL MODAL DE VISTA:
  cerrarModalVista(): void {
    this.modalVistaVisible = false;
    this.establecimientoSeleccionado = null;
  }

  //MÉTODO PARA CERRAR EL MODAL DE SEDES:
  cerrarModalSedes(): void {
    this.modalSedesVisible = false;
    this.establecimientoSeleccionado = null;
  }

  //MÉTODO QUE RECIBE EL TOAST EMITIDO POR LOS COMPONENTES HIJOS:
  recibirToast(evento: { tipo: string; mensaje: string }): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTipo = evento.tipo;
    this.toastMensaje = evento.mensaje;
    this.toastTimer = setTimeout(() => { this.toastMensaje = ''; }, 4000);
  }
}
