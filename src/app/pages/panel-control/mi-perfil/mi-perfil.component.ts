//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

//IMPORTACIÓN DE INTERFACES:
import { UsuariosI } from '../../../interfaces/panel-control/usuarios/usuarios.interface';

//IMPORTACIÓN DE SERVICIOS:
import { UsuariosService } from '../../../services/panel-control/usuarios/usuarios.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.scss']
})
export class MiPerfilComponent implements OnInit {

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

  //USUARIO CARGADO DESDE EL BACKEND — USADO PARA REPOBLAR EL FORMULARIO Y MANTENER CAMPOS NO EDITABLES:
  private usuario!: UsuariosI;

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    private usuariosService: UsuariosService
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
    }
    this.changeDetectorRef.detectChanges();
  }

  //NORMALIZA UNA FECHA DEL BACKEND AL FORMATO YYYY-MM-DDTHH:mm:
  formatearFechaParaInput(fecha: any): string {
    if (!fecha) return '';
    const s = String(fecha).replace(' ', 'T');
    return s.length > 16 ? s.slice(0, 16) : s;
  }

  //MÉTODO PARA MANEJAR LA SELECCIÓN DEL ARCHIVO DE FOTO:
  onSelectFileUserPhoto(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFileUserPhoto = file;
      this.isSelectedFileUserPhoto = true;
      this.nombreArchivoFotoExtensionoFormatoUsuario = file.name;
    }
  }

  //MÉTODO PARA MANEJAR LA DESELECCIÓN DEL ARCHIVO:
  onRemoveFileUserPhoto(): void {
    this.selectedFileUserPhoto = null;
    this.isSelectedFileUserPhoto = false;
    this.nombreArchivoFotoExtensionoFormatoUsuario = null;
  }

  //ENCRIPTA LA CONTRASEÑA CON BTOA x10 (IGUAL AL FLUJO DE LOGIN):
  obtenerPasswordUsuarioEncriptado(passwordPlano: any): string {
    let passwordEncriptado = passwordPlano;
    for (let i = 0; i < 10; i++) {
      passwordEncriptado = btoa(passwordEncriptado);
    }
    return passwordEncriptado;
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
      nombreArchivoFotoExtensionoFormatoUsuario: this.nombreArchivoFotoExtensionoFormatoUsuario
        ? this.nombreArchivoFotoExtensionoFormatoUsuario
        : fv.ctextNombreArchivoFotoExtensionoFormatoUsuario || '',
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
            this.guardarPerfilUsuario(usuarioActualizado, true, passwordEncriptado);
          },
          error: (err) => {
            console.error('ERROR AL ACTUALIZAR CONTRASEÑA: ', err);
            this.mostrarToast('error', 'Error al actualizar la contraseña. Intente nuevamente.');
          }
        });
    } else {
      //SOLO ACTUALIZA EL PERFIL SIN CAMBIO DE CONTRASEÑA:
      this.guardarPerfilUsuario(usuarioActualizado, false, null);
    }
  }

  //LLAMA AL SERVICIO DE ACTUALIZACIÓN DEL PERFIL Y ACTUALIZA EL LOCALSTORAGE:
  private guardarPerfilUsuario(usuario: UsuariosI, passwordCambiado: boolean, nuevoPasswordEncriptado: string | null): void {
    this.usuariosService.updateUser(usuario).subscribe({
      next: (respuesta) => {
        localStorage.setItem('nicknameUsuarioLogueado', String(usuario.nicknameUsuario));
        if (passwordCambiado && nuevoPasswordEncriptado) {
          localStorage.setItem('passwordUsuarioLogueadoEncriptado', nuevoPasswordEncriptado);
          this.passwordUsuarioLogueadoEncriptado = nuevoPasswordEncriptado;
        }
        this.nicknameUsuarioLogueado = String(usuario.nicknameUsuario);
        this.mostrarToast('exito', respuesta.mensaje || 'Perfil actualizado con éxito.');
        //RECARGA LOS DATOS ACTUALIZADOS DESDE EL BACKEND:
        this.cargarDatosUsuario();
      },
      error: (err) => {
        console.error('ERROR AL MODIFICAR PERFIL: ', err);
        this.mostrarToast('error', 'Error al modificar el perfil. Verifique la conexión con el servidor.');
      }
    });
  }
}
