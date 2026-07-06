//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

//IMPORTACIÓN DE INTERFACES:
import { UsuariosI } from '../../../../interfaces/panel-control/usuarios/usuarios.interface';
import { TiposUsuariosI } from '../../../../interfaces/panel-control/tipos-usuarios/tipos-usuarios.interface';

//IMPORTACIÓN DE SERVICIOS:
import { UsuariosService } from '../../../../services/panel-control/usuarios/usuarios.service';
import { TiposUsuariosService } from '../../../../services/panel-control/tipos-usuarios/tipos-usuarios.service';
import { SessionService } from '../../../../services/session/session.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-listado-usuarios',
  templateUrl: './listado-usuarios.component.html',
  styleUrls: ['./listado-usuarios.component.scss']
})
export class ListadoUsuariosComponent implements OnInit {

  //DECLARACIÓN DE VARIABLES GLOBALES:
  isLoggedIn: boolean = false;
  nicknameUsuarioLogueado: string | null = null;
  usuariosForm!: FormGroup;

  //SEMÁFORO DE ESTADOS — CONTADORES:
  totalRegistros: number = 0;
  totalRegistrosEstadosActivos: number = 0;
  totalRegistrosEstadosInactivos: number = 0;

  //PAGINACIÓN:
  paginaActual: number = 0;
  tandaNumeroRegistrosporPagina: number = 10;

  //BANDERAS DE BÚSQUEDA:
  banderaListarTodosUsuariosyOrdenarporIdAscPag: boolean = false;
  banderaListarTodosUsuariosporPalabraClaveyOrdenarporIdAscPag: boolean = false;
  banderaListarTodosUsuariosporNombreTipoUsuarioyOrdenarporIdAscPag: boolean = false;
  banderaListarTodosUsuariosporNombreTipoUsuarioyPalabraClaveyOrdenarporIdAscPag: boolean = false;

  //PRIVILEGIOS Y RESTRICCIONES DE ACCESO DEL USUARIO — SE ACTUALIZAN EN ngOnInit CON LOS PRIVILEGIOS Y RESTRICCIONES REALES:
  sioNoPrivilegioyRestriccionAccesoUsuarioCRUDPrivilegiosyRestricciones: string = 'NO';
  sioNoPrivilegioyRestriccionAccesoUsuarioCRUDVer: string = 'NO';
  sioNoPrivilegioyRestriccionAccesoUsuarioCRUDGuardar: string = 'NO';
  sioNoPrivilegioyRestriccionAccesoUsuarioCRUDModificar: string = 'NO';
  sioNoPrivilegioyRestriccionAccesoUsuarioCRUDEliminar: string = 'NO';

  //TIPOS DE USUARIO — CARGADOS DESDE EL BACKEND:
  tiposUsuarios: TiposUsuariosI[] = [];

  //LISTA DE USUARIOS TRAÍDA DEL BACKEND:
  usuarios: UsuariosI[] = [];

  //ESTADO DE MODALES:
  modalAddUpdDelVisible: boolean = false;
  modalVistaVisible: boolean = false;
  modalPrivilegiosVisible: boolean = false;
  modalModo: string = '';
  usuarioSeleccionado: UsuariosI | null = null;

  //TOAST GLOBAL:
  toastMensaje: string = '';
  toastTipo: string = '';
  private toastTimer: any = null;

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private formBuilder: FormBuilder,
    private usuariosService: UsuariosService,
    private tiposUsuariosService: TiposUsuariosService,
    private sessionService: SessionService
  ) {}

  //MÉTODO PRINCIPAL DEL COMPONENTE DONDE INVOCA A TODOS LOS MÉTODOS:
  ngOnInit(): void {
    //VERIFICA SI EL USUARIO ESTÁ AUTENTICADO AL CARGAR EL COMPONENTE:
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      this.isLoggedIn = true;
      this.nicknameUsuarioLogueado = localStorage.getItem('nicknameUsuarioLogueado');
    }
    this.initForm();
    this.cargarTiposUsuarios();
    this.accionListar();
    this.actualizarPrivilegiosyRestriccionesCRUD();
  }

  //CONSULTA LOS PRIVILEGIOS Y RESTRICCIONES DE ACCESO REALES DEL USUARIO LOGUEADO Y ACTUALIZA LAS BANDERAS
  //QUE MUESTRAN U OCULTAN LOS BOTONES DE VER/GUARDAR/MODIFICAR/ELIMINAR/PRIVILEGIOS Y RESTRICCIONES DE ESTE CRUD:
  private actualizarPrivilegiosyRestriccionesCRUD(): void {
    this.sessionService.cargarPrivilegios().subscribe({
      next: () => {
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDVer = this.sessionService.tieneAcceso('VER USUARIOS') ? 'SI' : 'NO';
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDGuardar = this.sessionService.tieneAcceso('GUARDAR USUARIOS') ? 'SI' : 'NO';
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDModificar = this.sessionService.tieneAcceso('MODIFICAR USUARIOS') ? 'SI' : 'NO';
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDEliminar = this.sessionService.tieneAcceso('ELIMINAR USUARIOS') ? 'SI' : 'NO';
        this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDPrivilegiosyRestricciones = this.sessionService.tieneAcceso('LISTADO DE PRIVILEGIOS Y RESTRICCIONES DE USUARIOS') ? 'SI' : 'NO';
      },
      error: (err) => console.error('ERROR AL CARGAR LOS PRIVILEGIOS Y RESTRICCIONES DEL USUARIO: ', err)
    });
  }

  //MÉTODO DE INICIALIZACIÓN DEL FORMULARIO:
  initForm(): void {
    this.usuariosForm = this.formBuilder.group({
      ctextPalabraClave: new FormControl(''),
      cboxTipoUsuarioSeleccionado: new FormControl(''),
      cboxTandaNumeroRegistrosporPaginaSeleccionado: new FormControl('10')
    });
  }

  //MÉTODO QUE CARGA LOS TIPOS DE USUARIO DESDE EL BACKEND:
  cargarTiposUsuarios(): void {
    this.tiposUsuariosService.findAllTypesOfUsers(undefined, undefined, 'nombreTipoUsuario', 'ASC')
      .subscribe({
        next: (tipos) => {
          this.tiposUsuarios = tipos;
        },
        error: (err) => console.error('ERROR AL CARGAR TIPOS DE USUARIOS: ', err)
      });
  }

  //MÉTODO DE BÚSQUEDA: RESETEA LA PÁGINA A 0 Y LLAMA EL LISTADO:
  buscar(): void {
    this.paginaActual = 0;
    this.accionListar();
  }

  //MÉTODO DE ACCIÓN DE LISTAR CON PAGINACIÓN REAL DESDE EL BACKEND:
  accionListar(): void {
    const formValues = this.usuariosForm.value;

    //1° BUSCADOR — palabra clave del campo de texto:
    const palabraClave = (formValues.ctextPalabraClave || '').trim().toUpperCase();
    const keyword: String | undefined = palabraClave || undefined;

    //2° TIPO DE USUARIO — nombre seleccionado en el combo ('' = "TODOS"):
    const tipoSeleccionado: string = (formValues.cboxTipoUsuarioSeleccionado as string) || '';

    //DETERMINACIÓN DE BANDERAS SEGÚN COMBINACIÓN DE FILTROS ACTIVOS:
    this.banderaListarTodosUsuariosyOrdenarporIdAscPag                                  = !keyword && !tipoSeleccionado;
    this.banderaListarTodosUsuariosporPalabraClaveyOrdenarporIdAscPag                   = !!keyword && !tipoSeleccionado;
    this.banderaListarTodosUsuariosporNombreTipoUsuarioyOrdenarporIdAscPag              = !keyword && !!tipoSeleccionado;
    this.banderaListarTodosUsuariosporNombreTipoUsuarioyPalabraClaveyOrdenarporIdAscPag = !!keyword && !!tipoSeleccionado;

    const nombreTipoUsuario: String | undefined = tipoSeleccionado || undefined;

    //LISTADO PAGINADO REAL DEL BACKEND (INCLUYE FILTRO EXACTO POR TIPO DE USUARIO):
    this.usuariosService.findAllUsersPag(
      this.paginaActual,
      this.tandaNumeroRegistrosporPagina,
      undefined,
      keyword,
      'idUsuario',
      'ASC',
      nombreTipoUsuario
    ).subscribe({
      next: (data) => this.usuarios = data,
      error: (err) => console.error('ERROR AL LISTAR USUARIOS: ', err)
    });

    //CONTADOR TOTAL FILTRADO (BASE PARA PAGINACIÓN):
    this.usuariosService.findCountTotalRegisters(undefined, keyword, nombreTipoUsuario)
      .subscribe({
        next: (n) => this.totalRegistros = n,
        error: (err) => console.error('ERROR AL CONTAR TOTAL USUARIOS: ', err)
      });

    //SEMÁFORO: total global → inactivos por keyword → activos derivado:
    this.usuariosService.findCountTotalRegisters()
      .subscribe({
        next: (total) => {
          this.usuariosService.findCountTotalRegisters(undefined, 'INACTIVO')
            .subscribe({
              next: (inactivos) => {
                this.totalRegistrosEstadosInactivos = inactivos;
                this.totalRegistrosEstadosActivos = total - inactivos;
              },
              error: (err) => console.error('ERROR AL CONTAR USUARIOS INACTIVOS: ', err)
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
    this.tandaNumeroRegistrosporPagina = Number(this.usuariosForm.value.cboxTandaNumeroRegistrosporPaginaSeleccionado);
    this.paginaActual = 0;
    this.accionListar();
  }

  //MÉTODO PARA DETERMINAR EL COLOR DE LA FRANJA DE CELDA POR FILA Y ESTADO:
  getRowColClass(numeroFila: number, numeroColumna: number, idRegistro: number, estadoRegistro: string): string {
    const valorModulo = numeroFila % 2;
    if (numeroColumna === 6 && estadoRegistro === 'INACTIVO') {
      return 'celda-franja4';
    }
    return valorModulo !== 0 ? 'celda-franja1' : 'celda-franja2';
  }

  //MÉTODO QUE RETORNA 'SI' O 'NO' DE PRIVILEGIOS Y RESTRICCIONES (SIMULADO — TODOS EN SI):
  getSioNoPrivilegioyRestriccionCRUDAccesoUsuarioporNombreFuncionalidadyNombreRol(nombreFuncionalidad: string, nombreRol: string): string {
    return 'SI';
  }

  //MÉTODO PARA ABRIR EL MODAL DE GUARDAR, MODIFICAR O ELIMINAR:
  OpenModalAddUpdDelUsuarioComponent(url: string): void {
    const partes = url.split('/');
    this.modalModo = partes[0];
    if (partes.length > 1) {
      const idUsuario = Number(partes[1]);
      this.usuarioSeleccionado = this.usuarios.find(u => u.idUsuario === idUsuario) || null;
    } else {
      this.usuarioSeleccionado = null;
    }
    this.modalAddUpdDelVisible = true;
  }

  //MÉTODO PARA ABRIR EL MODAL DE PRIVILEGIOS Y RESTRICCIONES:
  OpenModalPrivilegiosyRestriccionesUsuarioComponent(url: string): void {
    const partes = url.split('/');
    const idUsuario = Number(partes[partes.length - 1]);
    this.usuarioSeleccionado = this.usuarios.find(u => u.idUsuario === idUsuario) || null;
    this.modalPrivilegiosVisible = true;
  }

  //MÉTODO PARA ABRIR EL MODAL DE VISTA DE USUARIO:
  OpenModalVistaUsuarioComponent(url: string): void {
    const partes = url.split('/');
    const idUsuario = Number(partes[partes.length - 1]);
    this.usuarioSeleccionado = this.usuarios.find(u => u.idUsuario === idUsuario) || null;
    this.modalVistaVisible = true;
  }

  //MÉTODO PARA CERRAR EL MODAL DE ADD-UPD-DEL:
  cerrarModalAddUpdDel(): void {
    this.modalAddUpdDelVisible = false;
    this.usuarioSeleccionado = null;
    this.accionListar();
  }

  //MÉTODO PARA CERRAR EL MODAL DE PRIVILEGIOS Y RESTRICCIONES:
  cerrarModalPrivilegios(): void {
    this.modalPrivilegiosVisible = false;
    this.usuarioSeleccionado = null;
  }

  //MÉTODO PARA CERRAR EL MODAL DE VISTA:
  cerrarModalVista(): void {
    this.modalVistaVisible = false;
    this.usuarioSeleccionado = null;
  }

  //MÉTODO QUE RECIBE EL TOAST EMITIDO POR LOS COMPONENTES HIJOS Y LO MUESTRA DE FORMA INDEPENDIENTE:
  recibirToast(evento: { tipo: string; mensaje: string }): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTipo = evento.tipo;
    this.toastMensaje = evento.mensaje;
    this.toastTimer = setTimeout(() => { this.toastMensaje = ''; }, 4000);
  }
}
