//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

//IMPORTACIÓN DE INTERFACES:
import { UsuariosI } from '../../../../interfaces/panel-control/usuarios/usuarios.interface';
import { TiposDocumentosIdentificacionI } from '../../../../interfaces/tipos-documentos-identificacion/tipos-documentos-identificacion.interface';
import { TiposUsuariosI } from '../../../../interfaces/panel-control/tipos-usuarios/tipos-usuarios.interface';
import { DepartamentosoEstadosMundoI } from '../../../../interfaces/paises-mundo/departamentos-estados-mundo/departamentos-estados-mundo.interface';
import { CiudadesMundoI } from '../../../../interfaces/paises-mundo/departamentos-estados-mundo/ciudades-mundo/ciudades-mundo.interface';
import { ParametrosSistemaI } from '../../../../interfaces/panel-control/parametros-sistema/parametros-sistema.interface';

//IMPORTACIÓN DE SERVICIOS:
import { UsuariosService } from '../../../../services/panel-control/usuarios/usuarios.service';
import { TiposDocumentosIdentificacionService } from '../../../../services/tipos-documentos-identificacion/tipos-documentos-identificacion.service';
import { TiposUsuariosService } from '../../../../services/panel-control/tipos-usuarios/tipos-usuarios.service';
import { DepartamentosoEstadosMundoService } from '../../../../services/paises-mundo/departamentos-estados-mundo/departamentos-estados-mundo.service';
import { CiudadesMundoService } from '../../../../services/paises-mundo/departamentos-estados-mundo/ciudades-mundo/ciudades-mundo.service';
import { EmpleadosService } from '../../../../services/gestion-personal/empleados/empleados.service';
import { AuditoriasSistemaService } from '../../../../services/panel-control/auditorias-sistema/auditorias-sistema.service';
import { ParametrosSistemaService } from '../../../../services/panel-control/parametros-sistema/parametros-sistema.service';
import { GestionArchivosService } from '../../../../services/gestion-archivos/gestion-archivos.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-add-upd-del-usuario',
  templateUrl: './add-upd-del-usuario.component.html',
  styleUrls: ['./add-upd-del-usuario.component.scss']
})
export class AddUpdDelUsuarioComponent implements OnInit, OnChanges {

  //INPUTS: MODO Y DATOS DEL USUARIO SELECCIONADO:
  @Input() modo: string = 'guardar'; // 'guardar', 'modificar', 'eliminar'
  @Input() usuarioData: any = null;

  //OUTPUT: EVENTO PARA CERRAR EL MODAL:
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() toastEvento = new EventEmitter<{ tipo: string; mensaje: string }>();

  //DECLARACIÓN DE VARIABLES GLOBALES:
  isLoggedIn: boolean = false;
  usuariosForm!: FormGroup;
  usuarios!: UsuariosI;
  banderaCrudGuardar: boolean = false;
  banderaCrudModificar: boolean = false;
  banderaCrudEliminar: boolean = false;
  banderaConfirmacionEliminacion: boolean = false;
  banderaConfirmacionEliminacionFoto: boolean = false;
  mensajeExito: string = '';
  mensajeError: string = '';
  selectedFileUserPhoto: File | null = null;
  isSelectedFileUserPhoto: boolean = false;
  nombreArchivoFotoExtensionoFormatoUsuario: string = '';
  previewUrlFotoUsuario: string | null = null;
  private componenteInicializado: boolean = false;

  //LISTAS CARGADAS DESDE EL BACKEND:
  tiposDocumentosIdentificacion1: TiposDocumentosIdentificacionI[] = [];
  tiposUsuarios1: TiposUsuariosI[] = [];
  departamentosoEstadosMundo: DepartamentosoEstadosMundoI[] = [];
  ciudadesMundo: CiudadesMundoI[] = [];

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private usuariosService: UsuariosService,
    private tiposDocumentosIdentificacionService: TiposDocumentosIdentificacionService,
    private tiposUsuariosService: TiposUsuariosService,
    private departamentosoEstadosMundoService: DepartamentosoEstadosMundoService,
    private ciudadesMundoService: CiudadesMundoService,
    private empleadosService: EmpleadosService,
    private auditoriasSistemaService: AuditoriasSistemaService,
    private parametrosSistemaService: ParametrosSistemaService,
    private gestionArchivosService: GestionArchivosService
  ) {}

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') this.isLoggedIn = true;
    this.configurarBanderas();
    this.initForm();
    this.cargarCombos();
    if (this.banderaCrudModificar || this.banderaCrudEliminar) {
      this.cargarDatosUsuario();
    }
    this.componenteInicializado = true;
  }

  //DETECTA CAMBIOS EN LOS @Input Y RECONFIGURA EL FORMULARIO:
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.componenteInicializado) return;
    if (changes['modo'] || changes['usuarioData']) {
      this.configurarBanderas();
      this.mensajeExito = '';
      this.mensajeError = '';
      this.initForm();
      if (this.banderaCrudModificar || this.banderaCrudEliminar) {
        this.cargarDatosUsuario();
      }
    }
  }

  //CONFIGURA LAS BANDERAS CRUD SEGÚN EL MODO RECIBIDO:
  configurarBanderas(): void {
    this.banderaCrudGuardar = this.modo === 'guardar';
    this.banderaCrudModificar = this.modo === 'modificar';
    this.banderaCrudEliminar = this.modo === 'eliminar';
  }

  //INDICA SI EL REGISTRO QUE SE ESTÁ MODIFICANDO ES EL SUPER ADMINISTRADOR (idUsuario === 1), YA QUE
  //SOLO PUEDE EXISTIR UNO Y SU TIPO DE USUARIO NUNCA SE DEBE PODER CAMBIAR:
  get esUsuarioSuperAdministrador(): boolean {
    return this.banderaCrudModificar && this.usuarios?.idUsuario === 1;
  }

  //LISTA DE TIPOS DE USUARIO A MOSTRAR EN EL COMBO: SI SE ESTÁ MODIFICANDO AL SUPER ADMINISTRADOR, SOLO SE MUESTRA
  //SU PROPIO TIPO (PARA QUE EL COMBO QUEDE BLOQUEADO EN ESE VALOR); EN CUALQUIER OTRO CASO (GUARDAR O MODIFICAR OTRO
  //USUARIO) SE EXCLUYE "SUPER ADMINISTRADOR" PORQUE SOLO PUEDE EXISTIR UNO Y YA VIENE POR DEFECTO:
  get tiposUsuariosDisponibles(): TiposUsuariosI[] {
    if (this.esUsuarioSuperAdministrador) {
      return this.tiposUsuarios1.filter(tipo => tipo.nombreTipoUsuario === 'SUPER ADMINISTRADOR');
    }
    return this.tiposUsuarios1.filter(tipo => tipo.nombreTipoUsuario !== 'SUPER ADMINISTRADOR');
  }

  //CARGA TODOS LOS COMBOS DE SELECCIÓN DESDE EL BACKEND:
  cargarCombos(): void {
    this.tiposDocumentosIdentificacionService
      .findAllTypesOfIdentificationDocuments(undefined, undefined, 'nombreTipoDocumentoIdentificacion', 'ASC')
      .subscribe({
        next: (data: TiposDocumentosIdentificacionI[]) => { this.tiposDocumentosIdentificacion1 = data; },
        error: (err: any) => console.error('ERROR AL CARGAR TIPOS DE DOCUMENTO: ', err)
      });
    this.tiposUsuariosService
      .findAllTypesOfUsers(undefined, undefined, 'nombreTipoUsuario', 'ASC')
      .subscribe({
        next: (data: TiposUsuariosI[]) => { this.tiposUsuarios1 = data; },
        error: (err: any) => console.error('ERROR AL CARGAR TIPOS DE USUARIO: ', err)
      });
  }

  //CARGA LOS DATOS DEL USUARIO DESDE EL BACKEND Y LUEGO LLENA EL FORMULARIO:
  cargarDatosUsuario(): void {
    if (!this.usuarioData?.idUsuario) return;
    this.usuariosService.getUserbyId(Number(this.usuarioData.idUsuario))
      .subscribe({
        next: (respuesta: any) => {
          this.usuarios = respuesta.usuarioDTO;
          this.changeDetectorRef.detectChanges();
          this.chargueForm();
          if (this.usuarios.nombreArchivoFotoExtensionoFormatoUsuario) {
            this.resolverPreviewFotoUsuario(String(this.usuarios.nombreArchivoFotoExtensionoFormatoUsuario));
          }
          if (this.usuarios.paisOrigenUsuario && this.usuarios.departamentooEstadoOrigenUsuario) {
            this.cargarCboxNombresCiudadesMundoporNombrePaisMundoyNombreDepartamnentooEstadoMundo(
              String(this.usuarios.paisOrigenUsuario),
              String(this.usuarios.departamentooEstadoOrigenUsuario)
            );
          }
        },
        error: (err: any) => {
          console.error('ERROR AL CARGAR DATOS DEL USUARIO: ', err);
          this.mensajeError = 'Error al cargar los datos del usuario.';
        }
      });
  }

  //MÉTODO DE INICIALIZACIÓN DEL FORMULARIO (FORMULARIO VACÍO — MODO GUARDAR):
  initForm(): void {
    this.usuariosForm = this.formBuilder.group({
      ctextPalabraClaveNumeroDocumentoIdentificacionUsuario: new FormControl(''),
      ctextIdUsuario: new FormControl(''),
      ctextNicknameUsuario: new FormControl('', Validators.required),
      ctextPasswordUsuario1: new FormControl('', Validators.required),
      ctextPasswordUsuario2: new FormControl('', Validators.required),
      cboxNombreTipoDocumentoIdentificacionSeleccionado: new FormControl('', Validators.required),
      ctextNumeroDocumentoIdentificacionUsuario: new FormControl('', Validators.required),
      ctextLugarExpedicionDocumentoIdentificacionUsuario: new FormControl('', Validators.required),
      ctextNombresUsuario: new FormControl('', Validators.required),
      ctextPrimerApellidoUsuario: new FormControl('', Validators.required),
      ctextSegundoApellidoUsuario: new FormControl(''),
      ctextFechaHMSNacimientoUsuario: new FormControl('', Validators.required),
      cboxSexoUsuarioSeleccionado: new FormControl('', Validators.required),
      ctextDireccionUsuario: new FormControl('', Validators.required),
      ctextTelefonoUsuario: new FormControl(''),
      ctextMovilUsuario: new FormControl('', Validators.required),
      ctextCorreoElectronicoPersonalUsuario: new FormControl('', Validators.required),
      ctextCorreoElectronicoInstitucionalUsuario: new FormControl(''),
      ctextNombrePaisMundoOrigenUsuario: new FormControl(''),
      cboxNombrePaisMundoOrigenUsuarioSeleccionado: new FormControl(null),
      ctextNombreDepartamentooEstadoMundoOrigenUsuario: new FormControl(''),
      cboxNombreDepartamentooEstadoMundoOrigenUsuarioSeleccionado: new FormControl(null),
      dlistNombreCiudadMundoOrigenUsuario: new FormControl('', Validators.required),
      cboxNombreTipoUsuarioSeleccionado: new FormControl('', Validators.required),
      ctextFechaHMSIngresoUsuario: new FormControl({ value: this.obtenerFechaHoraActual(), disabled: true }),
      ctextFechaHMSModificacionUsuario: new FormControl({ value: '', disabled: true }),
      cboxEstadoUsuarioSeleccionado: new FormControl('', Validators.required),
      ctextNombreArchivoFotoExtensionoFormatoUsuario: new FormControl('')
    });
  }

  //MÉTODO DE CARGUE DEL FORMULARIO CON DATOS DEL BACKEND (MODOS MODIFICAR Y ELIMINAR):
  chargueForm(): void {
    const u = this.usuarios;
    this.usuariosForm = this.formBuilder.group({
      ctextPalabraClaveNumeroDocumentoIdentificacionUsuario: new FormControl(''),
      ctextIdUsuario: new FormControl(u.idUsuario || ''),
      ctextNicknameUsuario: new FormControl(u.nicknameUsuario || '', Validators.required),
      ctextPasswordUsuario1: new FormControl('', Validators.required),
      ctextPasswordUsuario2: new FormControl('', Validators.required),
      cboxNombreTipoDocumentoIdentificacionSeleccionado: new FormControl(
        u.tipoDocumentoIdentificacionDTO?.idTipoDocumentoIdentificacion || '', Validators.required
      ),
      ctextNumeroDocumentoIdentificacionUsuario: new FormControl(u.numeroDocumentoIdentificacionUsuario || '', Validators.required),
      ctextLugarExpedicionDocumentoIdentificacionUsuario: new FormControl(u.lugarExpedicionDocumentoIdentificacionUsuario || '', Validators.required),
      ctextNombresUsuario: new FormControl(u.nombresUsuario || '', Validators.required),
      ctextPrimerApellidoUsuario: new FormControl(u.primerApellidoUsuario || '', Validators.required),
      ctextSegundoApellidoUsuario: new FormControl(u.segundoApellidoUsuario || ''),
      ctextFechaHMSNacimientoUsuario: new FormControl(this.formatearFechaParaInput(u.fechaHMSNacimientoUsuario), Validators.required),
      cboxSexoUsuarioSeleccionado: new FormControl(u.sexoUsuario || '', Validators.required),
      ctextDireccionUsuario: new FormControl(u.direccionUsuario || '', Validators.required),
      ctextTelefonoUsuario: new FormControl(u.telefonoUsuario || ''),
      ctextMovilUsuario: new FormControl(u.movilUsuario || '', Validators.required),
      ctextCorreoElectronicoPersonalUsuario: new FormControl(u.correoElectronicoPersonalUsuario || '', Validators.required),
      ctextCorreoElectronicoInstitucionalUsuario: new FormControl(u.correoElectronicoInstitucionalUsuario || ''),
      ctextNombrePaisMundoOrigenUsuario: new FormControl(u.paisOrigenUsuario || ''),
      cboxNombrePaisMundoOrigenUsuarioSeleccionado: new FormControl(null),
      ctextNombreDepartamentooEstadoMundoOrigenUsuario: new FormControl(u.departamentooEstadoOrigenUsuario || ''),
      cboxNombreDepartamentooEstadoMundoOrigenUsuarioSeleccionado: new FormControl(null),
      dlistNombreCiudadMundoOrigenUsuario: new FormControl(u.ciudadOrigenUsuario || '', Validators.required),
      cboxNombreTipoUsuarioSeleccionado: new FormControl(
        u.tipoUsuarioDTO?.idTipoUsuario || '', Validators.required
      ),
      ctextFechaHMSIngresoUsuario: new FormControl({ value: this.formatearFechaParaInput(u.fechaHMSIngresoUsuario), disabled: true }),
      ctextFechaHMSModificacionUsuario: new FormControl({ value: this.obtenerFechaHoraActual(), disabled: true }),
      cboxEstadoUsuarioSeleccionado: new FormControl(u.estadoUsuario || '', Validators.required),
      ctextNombreArchivoFotoExtensionoFormatoUsuario: new FormControl(u.nombreArchivoFotoExtensionoFormatoUsuario || '')
    });
    this.changeDetectorRef.detectChanges();
  }

  //RETORNA LA FECHA Y HORA ACTUAL EN FORMATO YYYY-MM-DDTHH:mm:
  obtenerFechaHoraActual(): string {
    return new Date().toISOString().slice(0, 16);
  }

  //NORMALIZA UNA FECHA DEL BACKEND AL FORMATO YYYY-MM-DDTHH:mm REQUERIDO POR datetime-local:
  formatearFechaParaInput(fecha: any): string {
    if (!fecha) return '';
    const s = String(fecha).replace(' ', 'T');
    return s.length > 16 ? s.slice(0, 16) : s;
  }

  //MÉTODO QUE ENCRIPTA LA CONTRASEÑA CON BTOA 10 VECES:
  obtenerPasswordUsuarioEncriptado(passwordUsuario: string): string {
    let passwordEncriptado = passwordUsuario;
    for (let i = 0; i < 10; i++) {
      passwordEncriptado = btoa(passwordEncriptado);
    }
    return passwordEncriptado;
  }

  //MÉTODO QUE DESENCRIPTA LA CONTRASEÑA CON ATOB 10 VECES:
  obtenerPasswordUsuarioDesencriptado(passwordUsuarioEncriptado: string): string {
    let passwordDesencriptado = passwordUsuarioEncriptado;
    for (let i = 0; i < 10; i++) {
      passwordDesencriptado = atob(passwordDesencriptado);
    }
    return passwordDesencriptado;
  }

  //MÉTODO QUE CARGA LOS DEPARTAMENTOS/ESTADOS POR NOMBRE DE PAÍS:
  cargarCboxNombresDepartamentosoEstadosMundoporNombrePaisMundo(nombrePaisMundo: string): void {
    if (!nombrePaisMundo) return;
    this.departamentosoEstadosMundoService
      .findAllDepartmentsOrStatesOfTheWorld(undefined, nombrePaisMundo, undefined, 'nombreDepartamentooEstadoMundo', 'ASC')
      .subscribe({
        next: (data: DepartamentosoEstadosMundoI[]) => { this.departamentosoEstadosMundo = data; },
        error: (err: any) => console.error('ERROR AL CARGAR DEPARTAMENTOS: ', err)
      });
  }

  //MÉTODO QUE CARGA LAS CIUDADES POR NOMBRE DE PAÍS Y DEPARTAMENTO/ESTADO:
  cargarCboxNombresCiudadesMundoporNombrePaisMundoyNombreDepartamnentooEstadoMundo(nombrePaisMundo: string, nombreDepartamentooEstadoMundo: string): void {
    if (!nombrePaisMundo || !nombreDepartamentooEstadoMundo) return;
    this.ciudadesMundoService
      .findAllCitiesOfTheWorld(undefined, undefined, undefined, nombrePaisMundo, nombreDepartamentooEstadoMundo, undefined, 'nombreCiudadMundo', 'ASC')
      .subscribe({
        next: (data: CiudadesMundoI[]) => { this.ciudadesMundo = data; },
        error: (err: any) => console.error('ERROR AL CARGAR CIUDADES: ', err)
      });
  }

  //MÉTODO AUXILIAR QUE CARGA CIUDADES USANDO LOS VALORES ACTUALES DEL FORMULARIO:
  cargarCiudadesDesdeFormulario(): void {
    const fv = this.usuariosForm.getRawValue();
    const pais = (fv.ctextNombrePaisMundoOrigenUsuario || '').trim().toUpperCase();
    const depto = (fv.ctextNombreDepartamentooEstadoMundoOrigenUsuario || '').trim().toUpperCase();
    if (pais) {
      this.cargarCboxNombresDepartamentosoEstadosMundoporNombrePaisMundo(pais);
    }
    if (pais && depto) {
      this.cargarCboxNombresCiudadesMundoporNombrePaisMundoyNombreDepartamnentooEstadoMundo(pais, depto);
    }
  }

  //MÉTODO PARA MANEJAR LA SELECCIÓN DE ARCHIVO DE FOTO — VALIDA PESO MÁXIMO (2 MB) Y EXTENSIÓN SOPORTADA ANTES DE ACEPTARLO:
  onSelectFileUserPhoto(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;
    const extension = (file.name.split('.').pop() || '').toString();
    const extensionesPermitidas = ['jpg', 'JPG', 'jpeg', 'JPEG', 'bmp', 'BMP', 'png', 'PNG', 'gif', 'GIF'];
    const tamanoMaximoBytes = 2000000; //2.0 MB.
    if (file.size > tamanoMaximoBytes) {
      this.alertaMensajeError('Error', 'El archivo excede el tamaño máximo permitido de 2.0 MB.');
      event.target.value = '';
      return;
    }
    if (!extensionesPermitidas.includes(extension)) {
      this.alertaMensajeError('Error', 'El archivo debe tener una extensión válida (jpg, jpeg, bmp, png o gif).');
      event.target.value = '';
      return;
    }
    this.selectedFileUserPhoto = file;
    this.isSelectedFileUserPhoto = true;
  }

  //MÉTODO PARA CANCELAR LA SELECCIÓN PENDIENTE DE UN ARCHIVO NUEVO (NO BORRA LA FOTO YA ALMACENADA):
  onRemoveFileUserPhoto(): void {
    this.selectedFileUserPhoto = null;
    this.isSelectedFileUserPhoto = false;
  }

  //MÉTODO QUE ABRE EL DIÁLOGO DE CONFIRMACIÓN SI/NO ANTES DE ELIMINAR LA FOTO YA ALMACENADA DEL USUARIO:
  confirmarEliminarFotoUsuario(): void {
    if (!this.usuarios?.nombreArchivoFotoExtensionoFormatoUsuario) return;
    this.banderaConfirmacionEliminacionFoto = true;
  }

  //MÉTODO DE LA ALERTA DE CONFIRMACIÓN NO — CANCELA LA ELIMINACIÓN DE LA FOTO:
  noEliminarFotoUsuario(): void {
    this.banderaConfirmacionEliminacionFoto = false;
  }

  //MÉTODO DE LA ALERTA DE CONFIRMACIÓN SI — ELIMINA DEFINITIVAMENTE LA FOTO YA ALMACENADA DEL USUARIO: BORRA EL ARCHIVO FÍSICO DEL SERVIDOR DE ARCHIVOS Y LIMPIA EL CAMPO EN BASE DE DATOS:
  siEliminarFotoUsuario(): void {
    this.banderaConfirmacionEliminacionFoto = false;
    const nombreArchivoAEliminar = this.usuarios?.nombreArchivoFotoExtensionoFormatoUsuario;
    if (!nombreArchivoAEliminar) return;

    this.parametrosSistemaService.getSystemParameterbyId(1).subscribe({
      next: (respuestaParametros) => {
        const parametrosSistema = respuestaParametros.parametrosSistemaDTO;
        const ruta = String(parametrosSistema.rutaDestinoCarpetaPrincipalServidorAplicaciones)
          + String(parametrosSistema.rutaDestinoArchivosUsuarios) + String(nombreArchivoAEliminar);

        this.gestionArchivosService.deleteFile({ filePath: ruta }).subscribe({
          next: () => {
            //LIMPIA EL CAMPO DE LA FOTO EN EL REGISTRO DEL USUARIO:
            const usuarioSinFoto: any = { ...this.usuarios, nombreArchivoFotoExtensionoFormatoUsuario: '' };
            this.usuariosService.updateUser(usuarioSinFoto).subscribe({
              next: () => {
                this.previewUrlFotoUsuario = null;
                this.usuarios.nombreArchivoFotoExtensionoFormatoUsuario = '';
                this.usuariosForm.controls['ctextNombreArchivoFotoExtensionoFormatoUsuario'].setValue('');
                this.alertaMensajeExito('Confirmación', 'Foto del usuario eliminada correctamente.');
              },
              error: (err: any) => {
                console.error('ERROR AL LIMPIAR EL CAMPO DE LA FOTO DEL USUARIO: ', err);
                this.alertaMensajeError('Error', 'Se eliminó el archivo, pero no se pudo actualizar el registro del usuario.');
              }
            });
          },
          error: (err: any) => {
            console.error('ERROR AL ELIMINAR LA FOTO DEL USUARIO: ', err);
            this.alertaMensajeError('Error', 'No se pudo eliminar la foto del usuario.');
          }
        });
      },
      error: (err: any) => {
        console.error('ERROR AL OBTENER LOS PARÁMETROS DEL SISTEMA PARA ELIMINAR LA FOTO: ', err);
        this.alertaMensajeError('Error', 'No se pudo obtener la configuración de archivos del sistema.');
      }
    });
  }

  //ENCRIPTA EL NÚMERO DE DOCUMENTO DE IDENTIFICACIÓN CON BTOA x2 PARA CONFORMAR EL NOMBRE DEL ARCHIVO DE LA FOTO:
  obtenerNumeroDocumentoIdentificacionUsuarioEncriptado(numeroDocumentoIdentificacion: any): string {
    let numeroDocumentoIdentificacionEncriptado = numeroDocumentoIdentificacion;
    for (let i = 0; i < 2; i++) {
      numeroDocumentoIdentificacionEncriptado = btoa(numeroDocumentoIdentificacionEncriptado);
    }
    return numeroDocumentoIdentificacionEncriptado;
  }

  //RESUELVE LA URL PÚBLICA DE LA FOTO YA ALMACENADA EN EL SERVIDOR DE ARCHIVOS PARA MOSTRARLA COMO VISTA PREVIA:
  resolverPreviewFotoUsuario(nombreArchivo: string): void {
    this.parametrosSistemaService.getSystemParameterbyId(1).subscribe({
      next: (respuestaParametros) => {
        const parametrosSistema = respuestaParametros.parametrosSistemaDTO;
        //NOTA: NO SE CODIFICA AQUÍ EL NOMBRE DEL ARCHIVO — GestionArchivosService.getFile() YA ENVÍA LA RUTA COMPLETA
        //A TRAVÉS DE HttpParams, QUE LA CODIFICA AUTOMÁTICAMENTE (CODIFICARLA AQUÍ TAMBIÉN LA DEJARÍA CODIFICADA DOS VECES):
        const rutaCompleta = String(parametrosSistema.rutaDestinoCarpetaPrincipalServidorAplicaciones)
          + String(parametrosSistema.rutaDestinoArchivosUsuarios) + nombreArchivo;
        this.gestionArchivosService.getFile(rutaCompleta).subscribe({
          next: (respuestaArchivo) => {
            //SE DESCARGAN LOS BYTES DEL ARCHIVO AUTENTICADO (VER NOTA EN GestionArchivosService.getFileBytes) Y SE
            //ARMA UNA URL LOCAL DE OBJETO PARA USARLA COMO <img [src]>:
            this.gestionArchivosService.getFileBytes(respuestaArchivo.rutaEstatica).subscribe({
              next: (blob) => {
                if (this.previewUrlFotoUsuario) URL.revokeObjectURL(this.previewUrlFotoUsuario);
                this.previewUrlFotoUsuario = URL.createObjectURL(blob);
              },
              error: () => { this.previewUrlFotoUsuario = null; }
            });
          },
          error: () => { this.previewUrlFotoUsuario = null; }
        });
      },
      error: (err) => {
        console.error('ERROR AL OBTENER LOS PARÁMETROS DEL SISTEMA PARA LA VISTA PREVIA DE LA FOTO: ', err);
        this.previewUrlFotoUsuario = null;
      }
    });
  }

  //MÉTODO PARA CARGAR DATOS DEL EMPLEADO POR NÚMERO DE DOCUMENTO DESDE EL BACKEND (CONSULTA LA TABLA DE EMPLEADOS,
  //NO LA DE USUARIOS, YA QUE EL OBJETIVO ES REUTILIZAR LOS DATOS DE UN EMPLEADO YA REGISTRADO PARA CREARLE SU USUARIO):
  cargarDatosSiathEmpleadoporNumeroDocumentoIdentificacion(): void {
    this.mensajeExito = '';
    this.mensajeError = '';
    const fv = this.usuariosForm.getRawValue();
    const numeroDocumento = (fv.ctextPalabraClaveNumeroDocumentoIdentificacionUsuario || '').trim();
    if (!numeroDocumento) {
      this.mensajeError = 'Ingrese el número de documento de identificación.';
      return;
    }
    this.empleadosService.getEmployeebyNumeroDocumentoIdentificacion(numeroDocumento)
      .subscribe({
        next: (respuesta) => {
          this.changeDetectorRef.detectChanges();
          if (respuesta.empleadoDTO) {
            const e = respuesta.empleadoDTO;
            this.usuariosForm.patchValue({
              ctextNombresUsuario: e.nombresEmpleado || '',
              ctextPrimerApellidoUsuario: e.primerApellidoEmpleado || '',
              ctextSegundoApellidoUsuario: e.segundoApellidoEmpleado || '',
              ctextNumeroDocumentoIdentificacionUsuario: e.numeroDocumentoIdentificacionEmpleado || '',
              ctextDireccionUsuario: e.direccionEmpleado || '',
              ctextTelefonoUsuario: e.telefonoEmpleado || '',
              ctextMovilUsuario: e.movilEmpleado || '',
              ctextCorreoElectronicoPersonalUsuario: e.correoElectronicoPersonalEmpleado || '',
              ctextCorreoElectronicoInstitucionalUsuario: e.correoElectronicoInstitucionalEmpleado || '',
              ctextNombrePaisMundoOrigenUsuario: e.paisOrigenEmpleado || '',
              ctextNombreDepartamentooEstadoMundoOrigenUsuario: e.departamentooEstadoOrigenEmpleado || '',
              dlistNombreCiudadMundoOrigenUsuario: e.ciudadOrigenEmpleado || '',
              cboxNombreTipoDocumentoIdentificacionSeleccionado: e.tipoDocumentoIdentificacionDTO?.idTipoDocumentoIdentificacion || ''
            });
            if (e.paisOrigenEmpleado && e.departamentooEstadoOrigenEmpleado) {
              this.cargarCboxNombresCiudadesMundoporNombrePaisMundoyNombreDepartamnentooEstadoMundo(
                String(e.paisOrigenEmpleado), String(e.departamentooEstadoOrigenEmpleado)
              );
            }
            this.mensajeExito = 'Datos del empleado cargados correctamente.';
          } else {
            this.mensajeError = respuesta.mensaje || 'No se encontró el empleado con ese documento.';
          }
        },
        error: (err) => {
          console.error('ERROR AL BUSCAR EMPLEADO POR DOCUMENTO: ', err);
          this.mensajeError = 'No se encontró ningún empleado con ese número de documento.';
        }
      });
  }

  //MÉTODO DE LOS CRUDS — GUARDAR, MODIFICAR O ELIMINAR REGISTRO:
  accionesGuardarModificarEliminarRegistro(formValues: any): void {
    this.mensajeExito = '';
    this.mensajeError = '';
    const fv = this.usuariosForm.getRawValue();

    //MODO GUARDAR Y MODO MODIFICAR — SE CONSULTAN LOS PARÁMETROS DEL SISTEMA UNA SOLA VEZ (RUTAS DE ARCHIVOS)
    //ANTES DE CONTINUAR, YA QUE AMBOS MODOS PUEDEN NECESITAR CONFORMAR LA RUTA DE LA FOTO DEL USUARIO:
    if (this.banderaCrudGuardar) {
      if (fv.ctextPasswordUsuario1 !== fv.ctextPasswordUsuario2) {
        this.alertaMensajeError('Error', 'Las contraseñas no coinciden.');
        return;
      }
      this.parametrosSistemaService.getSystemParameterbyId(1).subscribe({
        next: (respuestaParametros) => this.procesarGuardarUsuario(fv, respuestaParametros.parametrosSistemaDTO),
        error: (err: any) => {
          console.error('ERROR AL OBTENER LOS PARÁMETROS DEL SISTEMA: ', err);
          this.alertaMensajeError('Error', 'No se pudo obtener la configuración de rutas de archivos del sistema.');
        }
      });
    }

    if (this.banderaCrudModificar) {
      if (fv.ctextPasswordUsuario1 && fv.ctextPasswordUsuario1 !== fv.ctextPasswordUsuario2) {
        this.alertaMensajeError('Error', 'Las contraseñas no coinciden.');
        return;
      }
      this.parametrosSistemaService.getSystemParameterbyId(1).subscribe({
        next: (respuestaParametros) => this.procesarModificarUsuario(fv, respuestaParametros.parametrosSistemaDTO),
        error: (err: any) => {
          console.error('ERROR AL OBTENER LOS PARÁMETROS DEL SISTEMA: ', err);
          this.alertaMensajeError('Error', 'No se pudo obtener la configuración de rutas de archivos del sistema.');
        }
      });
    }

    //MODO ELIMINAR — muestra el diálogo de confirmación SI/NO en lugar de eliminar directamente:
    if (this.banderaCrudEliminar) {
      this.confirmacionEliminacionRegistro();
    }
  }

  //PROCESA EL GUARDADO DEL USUARIO YA CON LOS PARÁMETROS DEL SISTEMA RESUELTOS (PARA LA RUTA DE LA FOTO):
  private procesarGuardarUsuario(fv: any, parametrosSistema: ParametrosSistemaI): void {
    const passwordEncriptado = this.obtenerPasswordUsuarioEncriptado(fv.ctextPasswordUsuario1);

    //SI SE SELECCIONÓ UNA FOTO NUEVA, SE CALCULA SU NOMBRE DE DESTINO (NÚMERO DE DOCUMENTO ENCRIPTADO + EXTENSIÓN)
    //ANTES DE CONSTRUIR EL OBJETO DEL USUARIO, PARA QUE EL CAMPO DE LA FOTO QUEDE CORRECTO DESDE EL PRIMER GUARDADO:
    let nombreArchivoNuevo: string | null = null;
    if (this.selectedFileUserPhoto) {
      const extension = (this.selectedFileUserPhoto.name.split('.').pop() || '').toString();
      nombreArchivoNuevo = this.obtenerNumeroDocumentoIdentificacionUsuarioEncriptado(fv.ctextNumeroDocumentoIdentificacionUsuario) + '.' + extension;
    }

    const nuevoUsuario: any = {
      nicknameUsuario: fv.ctextNicknameUsuario,
      passwordUsuario: passwordEncriptado,
      tipoDocumentoIdentificacionDTO: { idTipoDocumentoIdentificacion: Number(fv.cboxNombreTipoDocumentoIdentificacionSeleccionado) },
      numeroDocumentoIdentificacionUsuario: fv.ctextNumeroDocumentoIdentificacionUsuario,
      lugarExpedicionDocumentoIdentificacionUsuario: fv.ctextLugarExpedicionDocumentoIdentificacionUsuario,
      nombresUsuario: fv.ctextNombresUsuario,
      primerApellidoUsuario: fv.ctextPrimerApellidoUsuario,
      segundoApellidoUsuario: fv.ctextSegundoApellidoUsuario || '',
      nombreArchivoFotoExtensionoFormatoUsuario: nombreArchivoNuevo || '',
      fechaHMSNacimientoUsuario: fv.ctextFechaHMSNacimientoUsuario,
      sexoUsuario: fv.cboxSexoUsuarioSeleccionado,
      direccionUsuario: fv.ctextDireccionUsuario,
      telefonoUsuario: fv.ctextTelefonoUsuario || '',
      movilUsuario: fv.ctextMovilUsuario,
      correoElectronicoPersonalUsuario: fv.ctextCorreoElectronicoPersonalUsuario,
      correoElectronicoInstitucionalUsuario: fv.ctextCorreoElectronicoInstitucionalUsuario || '',
      paisOrigenUsuario: fv.ctextNombrePaisMundoOrigenUsuario || '',
      departamentooEstadoOrigenUsuario: fv.ctextNombreDepartamentooEstadoMundoOrigenUsuario || '',
      ciudadOrigenUsuario: fv.dlistNombreCiudadMundoOrigenUsuario,
      tipoUsuarioDTO: { idTipoUsuario: Number(fv.cboxNombreTipoUsuarioSeleccionado) },
      fechaHMSIngresoUsuario: fv.ctextFechaHMSIngresoUsuario || '',
      fechaHMSModificacionUsuario: '',
      estadoUsuario: fv.cboxEstadoUsuarioSeleccionado
    };
    this.usuariosService.addUser(nuevoUsuario)
      .subscribe({
        next: (respuesta: any) => {
          if (respuesta.mensaje && respuesta.mensaje.toLowerCase().includes('éxito')) {
            //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL CREAR UN USUARIO (VER AuditoriasSistemaService.registrarAuditoria):
            this.auditoriasSistemaService.registerSystemAudit(
              'CREAR USUARIO',
              `Se creó el usuario ${nuevoUsuario.nicknameUsuario} (documento ${nuevoUsuario.numeroDocumentoIdentificacionUsuario}).`
            );
            this.alertaMensajeExito('Confirmación', respuesta.mensaje);

            //SI HABÍA UNA FOTO NUEVA SELECCIONADA, SE SUBE AL SERVIDOR DE ARCHIVOS DE FORMA INDEPENDIENTE:
            if (nombreArchivoNuevo && this.selectedFileUserPhoto) {
              const rutaDestino = String(parametrosSistema.rutaDestinoCarpetaPrincipalServidorAplicaciones)
                + String(parametrosSistema.rutaDestinoArchivosUsuarios) + nombreArchivoNuevo;
              this.gestionArchivosService.uploadFile(this.selectedFileUserPhoto, rutaDestino).subscribe({
                next: () => {},
                error: (err: any) => {
                  console.error('ERROR AL SUBIR LA FOTO DEL USUARIO: ', err);
                  this.alertaMensajeError('Aviso', 'El usuario se creó, pero no se pudo subir la foto.');
                }
              });
            }

            setTimeout(() => this.closeModal(), 500);
          } else {
            this.alertaMensajeError('Error', respuesta.mensaje || 'Error al guardar el usuario.');
          }
        },
        error: (err: any) => {
          console.error('ERROR AL GUARDAR USUARIO: ', err);
          this.alertaMensajeError('Error', 'Error al guardar el usuario.');
        }
      });
  }

  //PROCESA LA MODIFICACIÓN DEL USUARIO YA CON LOS PARÁMETROS DEL SISTEMA RESUELTOS (PARA LA RUTA DE LA FOTO):
  private procesarModificarUsuario(fv: any, parametrosSistema: ParametrosSistemaI): void {
    const passwordEncriptado = fv.ctextPasswordUsuario1
      ? this.obtenerPasswordUsuarioEncriptado(fv.ctextPasswordUsuario1)
      : this.usuarios.passwordUsuario;

    //DECIDE QUÉ HACER CON EL ARCHIVO DE LA FOTO: SUBIR UNO NUEVO, RENOMBRAR EL EXISTENTE (SI SOLO CAMBIÓ EL
    //NÚMERO DE DOCUMENTO SIN SELECCIONAR UNA FOTO NUEVA) O NO HACER NADA:
    const docNumeroAnterior = String(this.usuarios.numeroDocumentoIdentificacionUsuario);
    const docNumeroNuevo = String(fv.ctextNumeroDocumentoIdentificacionUsuario);
    const nombreArchivoAnterior = this.usuarios.nombreArchivoFotoExtensionoFormatoUsuario ? String(this.usuarios.nombreArchivoFotoExtensionoFormatoUsuario) : '';
    const docNumeroCambio = docNumeroAnterior !== docNumeroNuevo;
    let nombreArchivoNuevo = nombreArchivoAnterior;
    let accionArchivo: 'ninguna' | 'subir' | 'renombrar' = 'ninguna';

    if (this.selectedFileUserPhoto) {
      const extension = (this.selectedFileUserPhoto.name.split('.').pop() || '').toString();
      nombreArchivoNuevo = this.obtenerNumeroDocumentoIdentificacionUsuarioEncriptado(docNumeroNuevo) + '.' + extension;
      accionArchivo = 'subir';
    } else if (docNumeroCambio && nombreArchivoAnterior) {
      const extensionAnterior = (nombreArchivoAnterior.split('.').pop() || '').toString();
      nombreArchivoNuevo = this.obtenerNumeroDocumentoIdentificacionUsuarioEncriptado(docNumeroNuevo) + '.' + extensionAnterior;
      accionArchivo = 'renombrar';
    }

    const usuarioModificado: any = {
      idUsuario: Number(fv.ctextIdUsuario),
      nicknameUsuario: fv.ctextNicknameUsuario,
      passwordUsuario: passwordEncriptado,
      tipoDocumentoIdentificacionDTO: { idTipoDocumentoIdentificacion: Number(fv.cboxNombreTipoDocumentoIdentificacionSeleccionado) },
      numeroDocumentoIdentificacionUsuario: fv.ctextNumeroDocumentoIdentificacionUsuario,
      lugarExpedicionDocumentoIdentificacionUsuario: fv.ctextLugarExpedicionDocumentoIdentificacionUsuario,
      nombresUsuario: fv.ctextNombresUsuario,
      primerApellidoUsuario: fv.ctextPrimerApellidoUsuario,
      segundoApellidoUsuario: fv.ctextSegundoApellidoUsuario || '',
      nombreArchivoFotoExtensionoFormatoUsuario: nombreArchivoNuevo || '',
      fechaHMSNacimientoUsuario: fv.ctextFechaHMSNacimientoUsuario,
      sexoUsuario: fv.cboxSexoUsuarioSeleccionado,
      direccionUsuario: fv.ctextDireccionUsuario,
      telefonoUsuario: fv.ctextTelefonoUsuario || '',
      movilUsuario: fv.ctextMovilUsuario,
      correoElectronicoPersonalUsuario: fv.ctextCorreoElectronicoPersonalUsuario,
      correoElectronicoInstitucionalUsuario: fv.ctextCorreoElectronicoInstitucionalUsuario || '',
      paisOrigenUsuario: fv.ctextNombrePaisMundoOrigenUsuario || '',
      departamentooEstadoOrigenUsuario: fv.ctextNombreDepartamentooEstadoMundoOrigenUsuario || '',
      ciudadOrigenUsuario: fv.dlistNombreCiudadMundoOrigenUsuario,
      tipoUsuarioDTO: { idTipoUsuario: Number(fv.cboxNombreTipoUsuarioSeleccionado) },
      fechaHMSIngresoUsuario: fv.ctextFechaHMSIngresoUsuario || '',
      fechaHMSModificacionUsuario: this.obtenerFechaHoraActual(),
      estadoUsuario: fv.cboxEstadoUsuarioSeleccionado
    };
    this.usuariosService.updateUser(usuarioModificado)
      .subscribe({
        next: (respuesta: any) => {
          if (respuesta.mensaje && respuesta.mensaje.toLowerCase().includes('éxito')) {
            //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL MODIFICAR UN USUARIO (VER AuditoriasSistemaService.registrarAuditoria):
            this.auditoriasSistemaService.registerSystemAudit(
              'MODIFICAR USUARIO',
              `Se modificó el usuario ${usuarioModificado.nicknameUsuario} (documento ${usuarioModificado.numeroDocumentoIdentificacionUsuario}).`
            );
            this.alertaMensajeExito('Confirmación', respuesta.mensaje);

            //EJECUTA LA ACCIÓN DE ARCHIVO QUE CORRESPONDA SOBRE LA FOTO DEL USUARIO, DE FORMA INDEPENDIENTE AL GUARDADO DEL REGISTRO:
            const rutaBase = String(parametrosSistema.rutaDestinoCarpetaPrincipalServidorAplicaciones) + String(parametrosSistema.rutaDestinoArchivosUsuarios);
            if (accionArchivo === 'subir' && this.selectedFileUserPhoto) {
              this.gestionArchivosService.uploadFile(this.selectedFileUserPhoto, rutaBase + nombreArchivoNuevo).subscribe({
                next: () => {},
                error: (err: any) => {
                  console.error('ERROR AL SUBIR LA FOTO DEL USUARIO: ', err);
                  this.alertaMensajeError('Aviso', 'El usuario se modificó, pero no se pudo subir la nueva foto.');
                }
              });
              //LIMPIEZA DEL ARCHIVO ANTERIOR SI QUEDÓ CON UN NOMBRE DISTINTO (POR EJEMPLO, CAMBIÓ EL DOCUMENTO Y TAMBIÉN LA FOTO):
              if (nombreArchivoAnterior && nombreArchivoAnterior !== nombreArchivoNuevo) {
                this.gestionArchivosService.deleteFile({ filePath: rutaBase + nombreArchivoAnterior }).subscribe({
                  next: () => {},
                  error: (err: any) => console.error('ERROR AL ELIMINAR LA FOTO ANTERIOR DEL USUARIO: ', err)
                });
              }
            } else if (accionArchivo === 'renombrar') {
              this.gestionArchivosService.renameFile({ oldPath: rutaBase + nombreArchivoAnterior, newPath: rutaBase + nombreArchivoNuevo }).subscribe({
                next: () => {},
                error: (err: any) => {
                  console.error('ERROR AL RENOMBRAR LA FOTO DEL USUARIO: ', err);
                  this.alertaMensajeError('Aviso', 'El usuario se modificó, pero no se pudo renombrar el archivo de la foto.');
                }
              });
            }

            setTimeout(() => this.closeModal(), 500);
          } else {
            this.alertaMensajeError('Error', respuesta.mensaje || 'Error al modificar el usuario.');
          }
        },
        error: (err: any) => {
          console.error('ERROR AL MODIFICAR USUARIO: ', err);
          this.alertaMensajeError('Error', 'Error al modificar el usuario.');
        }
      });
  }

  //MÉTODO QUE MUESTRA EL DIÁLOGO DE CONFIRMACIÓN DE ELIMINACIÓN:
  confirmacionEliminacionRegistro(): void {
    this.banderaConfirmacionEliminacion = true;
  }

  //MÉTODO DE LA ALERTA DE CONFIRMACIÓN SI — EJECUTA LA ELIMINACIÓN:
  siConfirmacionEliminacionRegistro(): void {
    this.banderaConfirmacionEliminacion = false;
    const fv = this.usuariosForm.getRawValue();
    const idUsuario = Number(fv.ctextIdUsuario);
    this.usuariosService.deleteUser(idUsuario)
      .subscribe({
        next: (respuesta: any) => {
          if (respuesta.mensaje && respuesta.mensaje.toLowerCase().includes('éxito')) {
            //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL ELIMINAR UN USUARIO (VER AuditoriasSistemaService.registrarAuditoria):
            this.auditoriasSistemaService.registerSystemAudit(
              'ELIMINAR USUARIO',
              `Se eliminó el usuario ${fv.ctextNicknameUsuario} (documento ${fv.ctextNumeroDocumentoIdentificacionUsuario}).`
            );
            this.alertaMensajeExito('Confirmación', respuesta.mensaje);

            //SI EL USUARIO ELIMINADO TENÍA UNA FOTO ASOCIADA, SE INTENTA BORRAR EL ARCHIVO FÍSICO DEL SERVIDOR
            //DE ARCHIVOS (BEST-EFFORT, NO BLOQUEA EL CIERRE DEL MODAL AL YA HABERSE ELIMINADO EL REGISTRO):
            const nombreArchivoExistente = this.usuarios?.nombreArchivoFotoExtensionoFormatoUsuario;
            if (nombreArchivoExistente) {
              this.parametrosSistemaService.getSystemParameterbyId(1).subscribe({
                next: (respuestaParametros) => {
                  const ps = respuestaParametros.parametrosSistemaDTO;
                  const ruta = String(ps.rutaDestinoCarpetaPrincipalServidorAplicaciones) + String(ps.rutaDestinoArchivosUsuarios) + String(nombreArchivoExistente);
                  this.gestionArchivosService.deleteFile({ filePath: ruta }).subscribe({
                    next: () => {},
                    error: (err: any) => console.error('ERROR AL ELIMINAR LA FOTO DEL USUARIO: ', err)
                  });
                },
                error: (err: any) => console.error('ERROR AL OBTENER PARÁMETROS PARA ELIMINAR LA FOTO: ', err)
              });
            }

            setTimeout(() => this.closeModal(), 500);
          } else {
            this.alertaMensajeError('Error', respuesta.mensaje || 'Error al eliminar el usuario.');
          }
        },
        error: (err: any) => {
          console.error('ERROR AL ELIMINAR USUARIO: ', err);
          this.alertaMensajeError('Error', 'Error al eliminar el usuario.');
        }
      });
  }

  //MÉTODO DE LA ALERTA DE CONFIRMACIÓN NO — CANCELA LA ELIMINACIÓN:
  noConfirmacionEliminacionRegistro(): void {
    this.banderaConfirmacionEliminacion = false;
  }

  //MÉTODO DE ALERTA DE MENSAJE ÉXITO CON LOS PARÁMETROS DE TÍTULO Y DESCRIPCIÓN:
  alertaMensajeExito(titulo: string, detalle: string): void {
    this.toastEvento.emit({ tipo: 'exito', mensaje: detalle });
  }

  //MÉTODO DE ALERTA DE MENSAJE ERROR CON LOS PARÁMETROS DE TÍTULO Y DESCRIPCIÓN:
  alertaMensajeError(titulo: string, detalle: string): void {
    this.toastEvento.emit({ tipo: 'error', mensaje: detalle });
  }

  //MÉTODO PARA CERRAR EL MODAL:
  closeModal(): void {
    this.cerrarModal.emit();
  }
}
