//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

//IMPORTACIÓN DE INTERFACES:
import { SedeEstablecimientoClienteI } from '../../../../../interfaces/panel-control/gestion-establecimientos-clientes/sedes-establecimientos-clientes/sedes-establecimientos-clientes.interface';
import { EstablecimientoClienteI } from '../../../../../interfaces/panel-control/gestion-establecimientos-clientes/establecimientos-clientes.interface';

//IMPORTACIÓN DE SERVICIOS:
import { SedesEstablecimientosClientesService } from '../../../../../services/panel-control/gestion-establecimientos-clientes/sedes-establecimientos-clientes/sedesEstablecimientosClientes.service';
import { SessionService } from '../../../../../services/session/session.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-listado-sedes-establec-clientes',
  templateUrl: './listado-sedes-establec-clientes.component.html',
  styleUrls: ['./listado-sedes-establec-clientes.component.scss']
})
export class ListadoSedesEstablecClientesComponent implements OnInit, OnChanges {

  //ENTRADA DE DATOS DESDE EL COMPONENTE PADRE:
  @Input() establecimientoData: EstablecimientoClienteI | null = null;

  //SALIDA DE EVENTOS HACIA EL COMPONENTE PADRE:
  @Output() cerrarModal = new EventEmitter<void>();

  //DECLARACIÓN DE VARIABLES GLOBALES:
  sedesForm!: FormGroup;

  //SEMÁFORO DE ESTADOS — CONTADORES:
  totalRegistros: number = 0;
  totalRegistrosEstadosActivos: number = 0;
  totalRegistrosEstadosInactivos: number = 0;

  //PAGINACIÓN:
  paginaActual: number = 0;
  tandaNumeroRegistrosporPagina: number = 5;

  //PRIVILEGIOS Y RESTRICCIONES DE ACCESO DEL USUARIO — SE ACTUALIZAN EN ngOnInit CON LOS PRIVILEGIOS Y RESTRICCIONES REALES:
  sioNoPrivilegioyRestriccionAccesoUsuarioCRUDVer: string = 'NO';
  sioNoPrivilegioyRestriccionAccesoUsuarioCRUDGuardar: string = 'NO';
  sioNoPrivilegioyRestriccionAccesoUsuarioCRUDModificar: string = 'NO';
  sioNoPrivilegioyRestriccionAccesoUsuarioCRUDEliminar: string = 'NO';

  //LISTA DE SEDES TRAÍDA DEL BACKEND (DEL ESTABLECIMIENTO ACTUAL):
  sedes: SedeEstablecimientoClienteI[] = [];

  //ESTADO DE MODALES:
  modalAddUpdDelVisible: boolean = false;
  modalVistaVisible: boolean = false;
  modalPuestosVisible: boolean = false;
  modalModo: string = '';
  sedeSeleccionada: SedeEstablecimientoClienteI | null = null;

  //TOAST GLOBAL:
  toastMensaje: string = '';
  toastTipo: string = '';
  private toastTimer: any = null;

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private formBuilder: FormBuilder,
    private sedesEstablecimientosClientesService: SedesEstablecimientosClientesService,
    private sessionService: SessionService
  ) {}

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    this.initForm();
    this.accionListar();
    this.actualizarPrivilegiosyRestriccionesCRUD();
  }

  //CONSULTA LOS PRIVILEGIOS Y RESTRICCIONES DE ACCESO REALES DEL USUARIO LOGUEADO Y ACTUALIZA LAS BANDERAS
  //QUE MUESTRAN U OCULTAN LOS BOTONES DE VER/GUARDAR/MODIFICAR/ELIMINAR DE ESTE CRUD:
  private actualizarPrivilegiosyRestriccionesCRUD(): void {
    this.sessionService.cargarPrivilegios().subscribe({
      next: () => {
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDVer = this.sessionService.tieneAcceso('VER SEDES DE ESTABLECIMIENTOS DE CLIENTES') ? 'SI' : 'NO';
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDGuardar = this.sessionService.tieneAcceso('GUARDAR SEDES DE ESTABLECIMIENTOS DE CLIENTES') ? 'SI' : 'NO';
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDModificar = this.sessionService.tieneAcceso('MODIFICAR SEDES DE ESTABLECIMIENTOS DE CLIENTES') ? 'SI' : 'NO';
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDEliminar = this.sessionService.tieneAcceso('ELIMINAR SEDES DE ESTABLECIMIENTOS DE CLIENTES') ? 'SI' : 'NO';
      },
      error: (err) => console.error('ERROR AL CARGAR LOS PRIVILEGIOS Y RESTRICCIONES DEL USUARIO: ', err)
    });
  }

  //DETECTA CAMBIO DEL ESTABLECIMIENTO CLIENTE PADRE:
  ngOnChanges(changes: SimpleChanges): void {
    if (this.sedesForm) {
      this.paginaActual = 0;
      this.accionListar();
    }
  }

  //MÉTODO DE INICIALIZACIÓN DEL FORMULARIO:
  initForm(): void {
    this.sedesForm = this.formBuilder.group({
      ctextPalabraClave: new FormControl(''),
      cboxTandaNumeroRegistrosporPaginaSeleccionado: new FormControl('5')
    });
  }

  //MÉTODO DE BÚSQUEDA: RESETEA LA PÁGINA A 0 Y LLAMA EL LISTADO:
  buscar(): void {
    this.paginaActual = 0;
    this.accionListar();
  }

  //MÉTODO DE ACCIÓN DE LISTAR — EL BACKEND NO TIENE FILTRO POR ESTABLECIMIENTO CLIENTE PADRE, ASÍ QUE SE TRAE EL LISTADO
  //COMPLETO (FILTRADO POR PALABRA CLAVE SI APLICA), SE FILTRA POR EL ESTABLECIMIENTO EN EL CLIENTE Y SE PAGINA MANUALMENTE:
  accionListar(): void {
    const idEstablecimientoCliente = this.establecimientoData?.idEstablecimientoCliente;
    if (!idEstablecimientoCliente) { this.sedes = []; this.totalRegistros = 0; return; }

    const formValues = this.sedesForm.value;
    const palabraClave = (formValues.ctextPalabraClave || '').trim().toUpperCase();
    const keyword: string | undefined = palabraClave || undefined;

    this.sedesEstablecimientosClientesService.findAllClientEstablishmentBranches(undefined, keyword, 'idSedeEstablecimientoCliente', 'ASC')
      .subscribe({
        next: (data) => {
          const sedesDelEstablecimiento = data.filter(
            s => s.establecimientoClienteDTO?.idEstablecimientoCliente === idEstablecimientoCliente
          );

          this.totalRegistros = sedesDelEstablecimiento.length;
          this.totalRegistrosEstadosActivos = sedesDelEstablecimiento.filter(s => s.estadoSedeEstablecimientoCliente === 'ACTIVO').length;
          this.totalRegistrosEstadosInactivos = sedesDelEstablecimiento.filter(s => s.estadoSedeEstablecimientoCliente === 'INACTIVO').length;

          const inicio = this.paginaActual * this.tandaNumeroRegistrosporPagina;
          this.sedes = sedesDelEstablecimiento.slice(inicio, inicio + this.tandaNumeroRegistrosporPagina);
        },
        error: (err) => console.error('ERROR AL LISTAR SEDES: ', err)
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
    const formValues = this.sedesForm.value;
    this.tandaNumeroRegistrosporPagina = Number(formValues.cboxTandaNumeroRegistrosporPaginaSeleccionado);
    this.paginaActual = 0;
    this.accionListar();
  }

  //MÉTODO PARA ABRIR EL MODAL DE GUARDAR, MODIFICAR O ELIMINAR:
  OpenModalAddUpdDelSedeEstablecClienteComponent(url: string): void {
    const partes = url.split('/');
    this.modalModo = partes[0];
    if (partes.length > 1) {
      const id = Number(partes[1]);
      this.sedeSeleccionada = this.sedes.find(s => s.idSedeEstablecimientoCliente === id) || null;
    } else {
      this.sedeSeleccionada = null;
    }
    this.modalAddUpdDelVisible = true;
  }

  //MÉTODO PARA ABRIR EL MODAL DE VISTA:
  OpenModalVistaSedeEstablecClienteComponent(url: string): void {
    const partes = url.split('/');
    const id = Number(partes[partes.length - 1]);
    this.sedeSeleccionada = this.sedes.find(s => s.idSedeEstablecimientoCliente === id) || null;
    this.modalVistaVisible = true;
  }

  //MÉTODO PARA ABRIR EL MODAL DE PUESTOS:
  OpenModalPuestosSedeEstablecClienteComponent(id: number): void {
    this.sedeSeleccionada = this.sedes.find(s => s.idSedeEstablecimientoCliente === id) || null;
    this.modalPuestosVisible = true;
  }

  //MÉTODO PARA CERRAR EL MODAL DE ADD-UPD-DEL:
  cerrarModalAddUpdDel(): void {
    this.modalAddUpdDelVisible = false;
    this.sedeSeleccionada = null;
    this.accionListar();
  }

  //MÉTODO PARA CERRAR EL MODAL DE VISTA:
  cerrarModalVista(): void {
    this.modalVistaVisible = false;
    this.sedeSeleccionada = null;
  }

  //MÉTODO PARA CERRAR EL MODAL DE PUESTOS:
  cerrarModalPuestos(): void {
    this.modalPuestosVisible = false;
    this.sedeSeleccionada = null;
  }

  //MÉTODO QUE RECIBE EL TOAST EMITIDO POR LOS COMPONENTES HIJOS:
  recibirToast(evento: { tipo: string; mensaje: string }): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTipo = evento.tipo;
    this.toastMensaje = evento.mensaje;
    this.toastTimer = setTimeout(() => { this.toastMensaje = ''; }, 4000);
  }

  //MÉTODO PARA CERRAR ESTE COMPONENTE:
  closeModal(): void {
    this.cerrarModal.emit();
  }
}
