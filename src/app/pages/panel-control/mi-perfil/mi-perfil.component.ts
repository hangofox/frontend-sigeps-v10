//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

//IMPORTACIÓN DE INTERFACES:
import { UsuariosI } from '../../../interfaces/panel-control/usuarios/usuarios.interface';
import { ParametrosSistemaI } from '../../../interfaces/panel-control/parametros-sistema/parametros-sistema.interface';

//IMPORTACIÓN DE SERVICIOS:
import { UsuariosService } from '../../../services/panel-control/usuarios/usuarios.service';
import { ParametrosSistemaService } from '../../../services/panel-control/parametros-sistema/parametros-sistema.service';
import { GestionArchivosService } from '../../../services/gestion-archivos/gestion-archivos.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.scss']
})
export class MiPerfilComponent implements OnInit {

  //OUTPUT: AVISA AL COMPONENTE PADRE (InicioComponent) CUANDO LA FOTO DEL USUARIO LOGUEADO CAMBIA (SUBIDA O
  //ELIMINADA), PARA QUE EL AVATAR DEL CABEZOTE SE ACTUALICE SIN NECESIDAD DE RECARGAR LA PÁGINA:
  @Output() fotoUsuarioActualizada = new EventEmitter<void>();

  //DECLARACIÓN DE VARIABLES GLOBALES:
  isLoggedIn: boolean = false;
  nicknameUsuarioLogueado: string | null = null;
  passwordUsuarioLogueadoEncriptado: string | null = null;
  miPerfilForm!: FormGroup;
  mensajeError: string = '';
  banderaContrasenasUsuarioIguales: boolean = false;

  //TOAST:
  toastMensaje: string = '';
  toastTipo: string = '';
  private toastTimer: any = null;
  banderaPoliticasSeguridadCumplidas: boolean = false;
  nombreArchivoFotoExtensionoFormatoUsuario: string | null = null;
  selectedFileUserPhoto: File | null = null;
  isSelectedFileUserPhoto: boolean = false;
  cargandoDatos: boolean = false;

  //VISTA PREVIA DE LA FOTO YA ALMACENADA EN EL SERVIDOR DE ARCHIVOS (VER resolverPreviewFotoUsuario):
  previewUrlFotoUsuario: string | null = null;

  //BANDERA DEL DIÁLOGO DE CONFIRMACIÓN SI/NO PARA ELIMINAR LA FOTO YA ALMACENADA:
  banderaConfirmacionEliminacionFoto: boolean = false;

  //USUARIO CARGADO DESDE EL BACKEND — USADO PARA REPOBLAR EL FORMULARIO Y MANTENER CAMPOS NO EDITABLES:
  private usuario!: UsuariosI;

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    private usuariosService: UsuariosService,
    private parametrosSistemaService: ParametrosSistemaService,
    private gestionArchivosService: GestionArchivosService
  ) {}

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      this.isLoggedIn = true;
      this.nicknameUsuarioLogueado = localStorage.getItem('nicknameUsuarioLogueado');
      this.passwordUsuarioLogueadoEncriptado = localStorage.getItem('passwordUsuarioLogueadoEncriptado');
    }
    this.initForm();
    this.cargarDatosUsuario();
  }

  //MÉTODO DE INICIALIZACIÓN DEL FORMULARIO (VACÍO — ESPERA A QUE LLEGUEN LOS DATOS DEL BACKEND):
  initForm(): void {
    this.miPerfilForm = this.formBuilder.group({
      ctextIdUsuario: new FormControl(''),
      ctextNicknameUsuario: new FormControl(''),
      ctextPasswordUsuario1: new FormControl(''),
      ctextPasswordUsuario2: new FormControl(''),
      ctextIdTipoDocumentoIdentificacion: new FormControl(''),
      ctextNombreTipoDocumentoIdentificacion: new FormControl(''),
      ctextNumeroDocumentoIdentificacionUsuario: new FormControl(''),
      ctextLugarExpedicionDocumentoIdentificacionUsuario: new FormControl(''),
      ctextNombresUsuario: new FormControl(''),
      ctextPrimerApellidoUsuario: new FormControl(''),
      ctextSegundoApellidoUsuario: new FormControl(''),
      ctextNombreArchivoFotoExtensionoFormatoUsuario: new FormControl(''),
      ctextFechaHMSNacimientoUsuario: new FormControl(''),
      ctextSexoUsuario: new FormControl(''),
      ctextDireccionUsuario: new FormControl('', Validators.required),
      ctextTelefonoUsuario: new FormControl(''),
      ctextMovilUsuario: new FormControl('', Validators.required),
      ctextCorreoElectronicoPersonalUsuario: new FormControl('', Validators.required),
      ctextCorreoElectronicoInstitucionalUsuario: new FormControl(''),
      ctextNombrePaisMundoOrigenUsuario: new FormControl(''),
      ctextNombreDepartamentooEstadoMundoOrigenUsuario: new FormControl(''),
      ctextNombreCiudadMundoOrigenUsuario: new FormControl(''),
      ctextNombreTipoUsuario: new FormControl(''),
      ctextIdTipoUsuario: new FormControl(''),
      ctextFechaHMSIngresoUsuario: new FormControl(''),
      ctextEstadoUsuario: new FormControl('', Validators.required)
    });
  }

  //CARGA LOS DATOS DEL USUARIO LOGUEADO DESDE EL BACKEND:
  cargarDatosUsuario(): void {
    if (!this.nicknameUsuarioLogueado || !this.passwordUsuarioLogueadoEncriptado) {
      this.mensajeError = 'No se encontraron credenciales en sesión. Por favor inicie sesión nuevamente.';
      return;
    }
    this.cargandoDatos = true;
    this.usuariosService.getUserbyNicknameAndPassword(
      this.nicknameUsuarioLogueado,
      this.passwordUsuarioLogueadoEncriptado
    ).subscribe({
      next: (respuesta) => {
        this.usuario = respuesta.usuarioDTO;
        this.cargandoDatos = false;
        this.chargueForm();
      },
      error: (err) => {
        this.cargandoDatos = false;
        console.error('ERROR AL CARGAR DATOS DEL PERFIL: ', err);
        this.mensajeError = 'Error al cargar los datos del perfil. Verifique la conexión con el servidor.';
      }
    });
  }

  //MÉTODO DE CARGUE DEL FORMULARIO CON DATOS DEL BACKEND:
  chargueForm(): void {
    const u = this.usuario;
    this.miPerfilForm.patchValue({
      ctextIdUsuario: u.idUsuario || '',
      ctextNicknameUsuario: u.nicknameUsuario || '',
      ctextPasswordUsuario1: '',
      ctextPasswordUsuario2: '',
      ctextIdTipoDocumentoIdentificacion: u.tipoDocumentoIdentificacionDTO?.idTipoDocumentoIdentificacion || '',
      ctextNombreTipoDocumentoIdentificacion: u.tipoDocumentoIdentificacionDTO?.nombreTipoDocumentoIdentificacion || '',
      ctextNumeroDocumentoIdentificacionUsuario: u.numeroDocumentoIdentificacionUsuario || '',
      ctextLugarExpedicionDocumentoIdentificacionUsuario: u.lugarExpedicionDocumentoIdentificacionUsuario || '',
      ctextNombresUsuario: u.nombresUsuario || '',
      ctextPrimerApellidoUsuario: u.primerApellidoUsuario || '',
      ctextSegundoApellidoUsuario: u.segundoApellidoUsuario || '',
      ctextNombreArchivoFotoExtensionoFormatoUsuario: u.nombreArchivoFotoExtensionoFormatoUsuario || '',
      ctextFechaHMSNacimientoUsuario: this.formatearFechaParaInput(u.fechaHMSNacimientoUsuario),
      ctextSexoUsuario: u.sexoUsuario || '',
      ctextDireccionUsuario: u.direccionUsuario || '',
      ctextTelefonoUsuario: u.telefonoUsuario || '',
      ctextMovilUsuario: u.movilUsuario || '',
      ctextCorreoElectronicoPersonalUsuario: u.correoElectronicoPersonalUsuario || '',
      ctextCorreoElectronicoInstitucionalUsuario: u.correoElectronicoInstitucionalUsuario || '',
      //CAMPOS DE ORIGEN — los nombres en el formulario difieren de los campos de la interfaz:
      ctextNombrePaisMundoOrigenUsuario: u.paisOrigenUsuario || '',
      ctextNombreDepartamentooEstadoMundoOrigenUsuario: u.departamentooEstadoOrigenUsuario || '',
      ctextNombreCiudadMundoOrigenUsuario: u.ciudadOrigenUsuario || '',
      ctextNombreTipoUsuario: u.tipoUsuarioDTO?.nombreTipoUsuario || '',
      ctextIdTipoUsuario: u.tipoUsuarioDTO?.idTipoUsuario || '',
      ctextFechaHMSIngresoUsuario: this.formatearFechaParaInput(u.fechaHMSIngresoUsuario),
      ctextEstadoUsuario: u.estadoUsuario || ''
    });
    if (u.nombreArchivoFotoExtensionoFormatoUsuario) {
      this.nombreArchivoFotoExtensionoFormatoUsuario = String(u.nombreArchivoFotoExtensionoFormatoUsuario);
      this.resolverPreviewFotoUsuario(this.nombreArchivoFotoExtensionoFormatoUsuario);
    }
    this.changeDetectorRef.detectChanges();
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

  //NORMALIZA UNA FECHA DEL BACKEND AL FORMATO YYYY-MM-DDTHH:mm:
  formatearFechaParaInput(fecha: any): string {
    if (!fecha) return '';
    const s = String(fecha).replace(' ', 'T');
    return s.length > 16 ? s.slice(0, 16) : s;
  }

  //MÉTODO PARA MANEJAR LA SELECCIÓN DEL ARCHIVO DE FOTO — VALIDA PESO MÁXIMO (2 MB) Y EXTENSIÓN SOPORTADA ANTES DE ACEPTARLO:
  onSelectFileUserPhoto(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;
    const extension = (file.name.split('.').pop() || '').toString();
    const extensionesPermitidas = ['jpg', 'JPG', 'jpeg', 'JPEG', 'bmp', 'BMP', 'png', 'PNG', 'gif', 'GIF'];
    const tamanoMaximoBytes = 2000000; //2.0 MB.
    if (file.size > tamanoMaximoBytes) {
      this.mostrarToast('error', 'El archivo excede el tamaño máximo permitido de 2.0 MB.');
      event.target.value = '';
      return;
    }
    if (!extensionesPermitidas.includes(extension)) {
      this.mostrarToast('error', 'El archivo debe tener una extensión válida (jpg, jpeg, bmp, png o gif).');
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

  //MÉTODO QUE ABRE EL DIÁLOGO DE CONFIRMACIÓN SI/NO ANTES DE ELIMINAR LA FOTO YA ALMACENADA:
  confirmarEliminarFotoUsuario(): void {
    if (!this.nombreArchivoFotoExtensionoFormatoUsuario) return;
    this.banderaConfirmacionEliminacionFoto = true;
  }

  //MÉTODO DE LA ALERTA DE CONFIRMACIÓN NO — CANCELA LA ELIMINACIÓN DE LA FOTO:
  noEliminarFotoUsuario(): void {
    this.banderaConfirmacionEliminacionFoto = false;
  }

  //MÉTODO DE LA ALERTA DE CONFIRMACIÓN SI — ELIMINA DEFINITIVAMENTE LA FOTO YA ALMACENADA: BORRA EL ARCHIVO FÍSICO DEL SERVIDOR DE ARCHIVOS Y LIMPIA EL CAMPO EN BASE DE DATOS:
  siEliminarFotoUsuario(): void {
    this.banderaConfirmacionEliminacionFoto = false;
    if (!this.nombreArchivoFotoExtensionoFormatoUsuario) return;
    const nombreArchivoAEliminar = this.nombreArchivoFotoExtensionoFormatoUsuario;

    this.parametrosSistemaService.getSystemParameterbyId(1).subscribe({
      next: (respuestaParametros) => {
        const parametrosSistema = respuestaParametros.parametrosSistemaDTO;
        const ruta = String(parametrosSistema.rutaDestinoCarpetaPrincipalServidorAplicaciones)
          + String(parametrosSistema.rutaDestinoArchivosUsuarios) + nombreArchivoAEliminar;

        this.gestionArchivosService.deleteFile({ filePath: ruta }).subscribe({
          next: () => {
            //LIMPIA EL CAMPO DE LA FOTO EN EL REGISTRO DEL USUARIO:
            const usuarioSinFoto: UsuariosI = { ...this.usuario, nombreArchivoFotoExtensionoFormatoUsuario: '' };
            this.usuariosService.updateUser(usuarioSinFoto).subscribe({
              next: () => {
                this.nombreArchivoFotoExtensionoFormatoUsuario = null;
                this.previewUrlFotoUsuario = null;
                this.mostrarToast('exito', 'Foto de perfil eliminada correctamente.');
                this.cargarDatosUsuario();
                this.fotoUsuarioActualizada.emit();
              },
              error: (err) => {
                console.error('ERROR AL LIMPIAR EL CAMPO DE LA FOTO DEL USUARIO: ', err);
                this.mostrarToast('error', 'Se eliminó el archivo, pero no se pudo actualizar el registro del usuario.');
              }
            });
          },
          error: (err) => {
            console.error('ERROR AL ELIMINAR LA FOTO DE PERFIL: ', err);
            this.mostrarToast('error', 'No se pudo eliminar la foto de perfil.');
          }
        });
      },
      error: (err) => {
        console.error('ERROR AL OBTENER LOS PARÁMETROS DEL SISTEMA PARA ELIMINAR LA FOTO: ', err);
        this.mostrarToast('error', 'No se pudo obtener la configuración de archivos del sistema.');
      }
    });
  }

  //ENCRIPTA LA CONTRASEÑA CON BTOA x10 (IGUAL AL FLUJO DE LOGIN):
  obtenerPasswordUsuarioEncriptado(passwordPlano: any): string {
    let passwordEncriptado = passwordPlano;
    for (let i = 0; i < 10; i++) {
      passwordEncriptado = btoa(passwordEncriptado);
    }
    return passwordEncriptado;
  }

  //ENCRIPTA EL NÚMERO DE DOCUMENTO DE IDENTIFICACIÓN CON BTOA x2 PARA CONFORMAR EL NOMBRE DEL ARCHIVO DE LA FOTO:
  obtenerNumeroDocumentoIdentificacionUsuarioEncriptado(numeroDocumentoIdentificacion: any): string {
    let numeroDocumentoIdentificacionEncriptado = numeroDocumentoIdentificacion;
    for (let i = 0; i < 2; i++) {
      numeroDocumentoIdentificacionEncriptado = btoa(numeroDocumentoIdentificacionEncriptado);
    }
    return numeroDocumentoIdentificacionEncriptado;
  }

  //MUESTRA EL TOAST DE NOTIFICACIÓN:
  mostrarToast(tipo: string, mensaje: string): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTipo = tipo;
    this.toastMensaje = mensaje;
    this.toastTimer = setTimeout(() => { this.toastMensaje = ''; }, 4000);
  }

  //MÉTODO DE CRUDS — MODIFICAR PERFIL DEL USUARIO LOGUEADO:
  accionModificarRegistro(formValues: any): void {
    this.mensajeError = '';
    const fv = this.miPerfilForm.getRawValue();

    //DETERMINA SI EL USUARIO QUIERE CAMBIAR LA CONTRASEÑA:
    const nuevaPassword1 = (fv.ctextPasswordUsuario1 || '').trim();
    const nuevaPassword2 = (fv.ctextPasswordUsuario2 || '').trim();
    const quiereCambiarPassword = nuevaPassword1.length > 0 || nuevaPassword2.length > 0;

    //VALIDACIONES DE CONTRASEÑA SI SE VA A CAMBIAR:
    if (quiereCambiarPassword) {
      this.banderaContrasenasUsuarioIguales = nuevaPassword1 === nuevaPassword2 && !!nuevaPassword1;
      const regexPoliticaSeguridadPassword = /^(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
      this.banderaPoliticasSeguridadCumplidas = regexPoliticaSeguridadPassword.test(nuevaPassword1);

      if (!this.banderaContrasenasUsuarioIguales) {
        this.mensajeError = 'La contraseña y la confirmación no son iguales.';
        return;
      }
      if (!this.banderaPoliticasSeguridadCumplidas) {
        this.mensajeError = 'La contraseña debe tener mínimo 8 caracteres, al menos una letra mayúscula y un número.';
        return;
      }
    }

    //VALIDACIÓN DE CAMPOS OBLIGATORIOS DEL FORMULARIO:
    if (!fv.ctextDireccionUsuario || !fv.ctextMovilUsuario || !fv.ctextCorreoElectronicoPersonalUsuario) {
      this.mensajeError = 'Complete los campos obligatorios: dirección, celular y correo electrónico personal.';
      return;
    }

    //SI SE SELECCIONÓ UNA FOTO NUEVA, PRIMERO SE CONSULTAN LOS PARÁMETROS DEL SISTEMA PARA CONFORMAR EL NOMBRE
    //DEL ARCHIVO (NÚMERO DE DOCUMENTO ENCRIPTADO + EXTENSIÓN) ANTES DE CONTINUAR CON EL GUARDADO DEL PERFIL:
    if (this.selectedFileUserPhoto) {
      this.parametrosSistemaService.getSystemParameterbyId(1).subscribe({
        next: (respuestaParametros) => {
          const parametrosSistema = respuestaParametros.parametrosSistemaDTO;
          const extension = (this.selectedFileUserPhoto!.name.split('.').pop() || '').toString();
          const nuevoNombreArchivo = this.obtenerNumeroDocumentoIdentificacionUsuarioEncriptado(fv.ctextNumeroDocumentoIdentificacionUsuario) + '.' + extension;
          this.continuarGuardadoPerfil(fv, quiereCambiarPassword, nuevaPassword1, nuevoNombreArchivo, parametrosSistema);
        },
        error: (err) => {
          console.error('ERROR AL OBTENER LOS PARÁMETROS DEL SISTEMA: ', err);
          this.mostrarToast('error', 'No se pudo obtener la configuración de archivos del sistema.');
        }
      });
    } else {
      this.continuarGuardadoPerfil(fv, quiereCambiarPassword, nuevaPassword1, null, null);
    }
  }

  //CONTINÚA EL GUARDADO DEL PERFIL YA CON EL NOMBRE DE ARCHIVO DE LA FOTO (SI APLICA) RESUELTO:
  private continuarGuardadoPerfil(
    fv: any,
    quiereCambiarPassword: boolean,
    nuevaPassword1: string,
    nuevoNombreArchivo: string | null,
    parametrosSistema: ParametrosSistemaI | null
  ): void {
    //CONSTRUYE EL OBJETO UsuariosI CON LOS VALORES DEL FORMULARIO:
    const usuarioActualizado: UsuariosI = {
      idUsuario: Number(fv.ctextIdUsuario),
      nicknameUsuario: fv.ctextNicknameUsuario,
      passwordUsuario: this.usuario.passwordUsuario, //MANTIENE LA CONTRASEÑA ENCRIPTADA ACTUAL
      tipoDocumentoIdentificacionDTO: {
        idTipoDocumentoIdentificacion: Number(fv.ctextIdTipoDocumentoIdentificacion),
        nombreTipoDocumentoIdentificacion: fv.ctextNombreTipoDocumentoIdentificacion || ''
      },
      numeroDocumentoIdentificacionUsuario: fv.ctextNumeroDocumentoIdentificacionUsuario,
      lugarExpedicionDocumentoIdentificacionUsuario: fv.ctextLugarExpedicionDocumentoIdentificacionUsuario || '',
      nombresUsuario: fv.ctextNombresUsuario,
      primerApellidoUsuario: fv.ctextPrimerApellidoUsuario,
      segundoApellidoUsuario: fv.ctextSegundoApellidoUsuario || '',
      nombreArchivoFotoExtensionoFormatoUsuario: nuevoNombreArchivo
        || this.nombreArchivoFotoExtensionoFormatoUsuario
        || fv.ctextNombreArchivoFotoExtensionoFormatoUsuario || '',
      fechaHMSNacimientoUsuario: fv.ctextFechaHMSNacimientoUsuario || '',
      sexoUsuario: fv.ctextSexoUsuario || '',
      direccionUsuario: fv.ctextDireccionUsuario,
      telefonoUsuario: fv.ctextTelefonoUsuario || '',
      movilUsuario: fv.ctextMovilUsuario,
      correoElectronicoPersonalUsuario: fv.ctextCorreoElectronicoPersonalUsuario,
      correoElectronicoInstitucionalUsuario: fv.ctextCorreoElectronicoInstitucionalUsuario || '',
      //MAPEO CORRECTO: nombres del form → campos de la interfaz:
      paisOrigenUsuario: fv.ctextNombrePaisMundoOrigenUsuario || '',
      departamentooEstadoOrigenUsuario: fv.ctextNombreDepartamentooEstadoMundoOrigenUsuario || '',
      ciudadOrigenUsuario: fv.ctextNombreCiudadMundoOrigenUsuario || '',
      tipoUsuarioDTO: {
        idTipoUsuario: Number(fv.ctextIdTipoUsuario),
        nombreTipoUsuario: fv.ctextNombreTipoUsuario || ''
      },
      fechaHMSIngresoUsuario: fv.ctextFechaHMSIngresoUsuario || '',
      fechaHMSModificacionUsuario: new Date().toISOString(),
      estadoUsuario: fv.ctextEstadoUsuario
    };

    //SI EL USUARIO QUIERE CAMBIAR LA CONTRASEÑA — PRIMERO ACTUALIZA EL PASSWORD Y LUEGO EL PERFIL:
    if (quiereCambiarPassword) {
      const passwordEncriptado = this.obtenerPasswordUsuarioEncriptado(nuevaPassword1);
      usuarioActualizado.passwordUsuario = passwordEncriptado;

      this.usuariosService.updatePassword(Number(fv.ctextIdUsuario), passwordEncriptado)
        .subscribe({
          next: () => {
            this.guardarPerfilUsuario(usuarioActualizado, true, passwordEncriptado, nuevoNombreArchivo, parametrosSistema);
          },
          error: (err) => {
            console.error('ERROR AL ACTUALIZAR CONTRASEÑA: ', err);
            this.mostrarToast('error', 'Error al actualizar la contraseña. Intente nuevamente.');
          }
        });
    } else {
      //SOLO ACTUALIZA EL PERFIL SIN CAMBIO DE CONTRASEÑA:
      this.guardarPerfilUsuario(usuarioActualizado, false, null, nuevoNombreArchivo, parametrosSistema);
    }
  }

  //LLAMA AL SERVICIO DE ACTUALIZACIÓN DEL PERFIL, ACTUALIZA EL LOCALSTORAGE Y, SI HAY UNA FOTO NUEVA SELECCIONADA, LA SUBE:
  private guardarPerfilUsuario(
    usuario: UsuariosI,
    passwordCambiado: boolean,
    nuevoPasswordEncriptado: string | null,
    nuevoNombreArchivo: string | null,
    parametrosSistema: ParametrosSistemaI | null
  ): void {
    this.usuariosService.updateUser(usuario).subscribe({
      next: (respuesta) => {
        localStorage.setItem('nicknameUsuarioLogueado', String(usuario.nicknameUsuario));
        if (passwordCambiado && nuevoPasswordEncriptado) {
          localStorage.setItem('passwordUsuarioLogueadoEncriptado', nuevoPasswordEncriptado);
          this.passwordUsuarioLogueadoEncriptado = nuevoPasswordEncriptado;
        }
        this.nicknameUsuarioLogueado = String(usuario.nicknameUsuario);
        this.mostrarToast('exito', respuesta.mensaje || 'Perfil actualizado con éxito.');

        //SI HABÍA UNA FOTO NUEVA SELECCIONADA, SE SUBE AL SERVIDOR DE ARCHIVOS DE FORMA INDEPENDIENTE (NO BLOQUEA EL GUARDADO DEL PERFIL).
        //LA RECARGA DE DATOS SE HACE DESPUÉS DE QUE LA SUBIDA TERMINE (Y NO EN PARALELO), PARA EVITAR QUE LA VISTA
        //PREVIA INTENTE RESOLVER UN ARCHIVO QUE TODAVÍA NO TERMINA DE ESCRIBIRSE EN EL SERVIDOR DE ARCHIVOS:
        if (nuevoNombreArchivo && parametrosSistema && this.selectedFileUserPhoto) {
          const rutaDestino = String(parametrosSistema.rutaDestinoCarpetaPrincipalServidorAplicaciones)
            + String(parametrosSistema.rutaDestinoArchivosUsuarios) + nuevoNombreArchivo;
          this.gestionArchivosService.uploadFile(this.selectedFileUserPhoto, rutaDestino).subscribe({
            next: () => {
              this.mostrarToast('exito', 'Foto de perfil actualizada correctamente.');
              this.selectedFileUserPhoto = null;
              this.isSelectedFileUserPhoto = false;
              this.cargarDatosUsuario();
              this.fotoUsuarioActualizada.emit();
            },
            error: (err) => {
              console.error('ERROR AL SUBIR LA FOTO DE PERFIL: ', err);
              this.mostrarToast('error', 'El perfil se guardó, pero no se pudo subir la foto.');
              this.cargarDatosUsuario();
            }
          });
        } else {
          //RECARGA LOS DATOS ACTUALIZADOS DESDE EL BACKEND:
          this.cargarDatosUsuario();
        }
      },
      error: (err) => {
        console.error('ERROR AL MODIFICAR PERFIL: ', err);
        this.mostrarToast('error', 'Error al modificar el perfil. Verifique la conexión con el servidor.');
      }
    });
  }
}
