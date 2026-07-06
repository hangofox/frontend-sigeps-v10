//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

//IMPORTACIÓN DE INTERFACES:
import { LoginCredencialesI } from '../../interfaces/login-credenciales/login-credenciales.interface';

//IMPORTACIÓN DE SERVICIOS:
import { TokensAutorizacionesService } from '../../services/tokens-autorizaciones/tokens-autorizaciones.service';
import { UsuariosService } from '../../services/panel-control/usuarios/usuarios.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  //DECLARACIÓN DE VARIABLES GLOBALES:
  ctextNicknameUsuarioDigitado: string = "";//Propiedad para almacenar el nickname del usuario digitado.
  ctextPasswordUsuarioDigitado: string = "";//Propiedad para almacenar el password del usuario digitado.
  ctextCodigoCaptchaGenerado: string = "";//Propiedad para almacenar el código captcha generado.
  ctextCaptchaUsuarioDigitado: string = "";//Propiedad para almacenar el captcha digitado por el usuario.
  hidePassword: boolean = true;//Por defecto, oculta la contraseña.
  mensajeNicknameUsuarioDigitadoNulo: string = "";//Agrega esta propiedad para manejar los mensajes en nulo.
  mensajePasswordUsuarioDigitadoNulo: string = "";//Agrega esta propiedad para manejar los mensajes en nulo.
  mensajeCaptchaUsuarioDigitadoNulo: string = "";//Agrega esta propiedad para manejar los mensajes en nulo.
  mensajeCCaptchaDigyCCaptchaGeneradoDiferentes: string = "";//Agrega esta propiedad para manejar la comparación de códigos captchas.
  banderaCCaptchaDigyCCaptchaGeneradoIguales: number = 0;
  banderaAccesoConcedido: boolean = false;//Variable para controlar la alerta de acceso concedido.
  mensajeError: string = "";//Propiedad para mostrar mensajes de error del backend.
  cargando: boolean = false;//Propiedad para controlar el estado de carga del botón.
  passwordUsuarioEncriptado: string = "";
  tokenAutorizacion: string = "";

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private tokensAutorizacionesService: TokensAutorizacionesService,
    private usuariosService: UsuariosService
  ) {}

  //MÉTODO PRINCIPAL DEL COMPONENTE DONDE INVOCA A TODOS LOS MÉTODOS:
  ngOnInit(): void {
    this.generadorCodigoCaptcha();
    //SI EL USUARIO YA TIENE SESIÓN ACTIVA, SE REDIRIGE A LA PÁGINA DE INICIO:
    if (localStorage.getItem('isLoggedIn') === 'true') {
      this.router.navigate(['/inicio']);
    }
  }

  //MÉTODO QUE GENERA EL CÓDIGO CAPTCHA ALFANUMÉRICO DE 6 DÍGITOS CON LETRAS MAYÚSCULAS:
  generadorCodigoCaptcha(): void {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 6;
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    this.ctextCodigoCaptchaGenerado = result;
    this.ctextCaptchaUsuarioDigitado = "";
  }

  //MÉTODO QUE ALTERNA LA VISIBILIDAD DE LA CONTRASEÑA:
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  //MÉTODO QUE OBTIENE EL TOKEN DE AUTORIZACIÓN DEL USUARIO:
  obtenerTokenAutorizacionporNicknameyPassword(nicknameUsuario: any, passwordUsuario: any): Promise<{ tokenAutorizacion: any }> {
    return new Promise((resolve, reject) => {

      //PLANTILLA DE INTERFAZ DEL OBJETO DEL REGISTRO:
      const loginCredenciales: LoginCredencialesI = {
        nicknameUsuario: nicknameUsuario,//DATO PRIMARIO.
        passwordUsuario: passwordUsuario//DATO PRIMARIO.
      }

      this.tokensAutorizacionesService.tokenAuthorizationByNicknameAndPassword(loginCredenciales)
        .subscribe({
          next: (data) => {
            this.changeDetectorRef.detectChanges();//PERMITE QUE LOS DATOS PROVENIENTES DEL BACKEND SE ACTUALICEN Y EL OBJETO SE LIMPIE DE DATOS ANTERIORES, ERRONEOS Y NULOS.

            //RETORNA EL TOKEN SI EXISTE, O NULL SI EL BACKEND NO LO GENERÓ:
            if (data.tokenAutorizacion) {
              resolve({
                tokenAutorizacion: data.tokenAutorizacion
              });
            }
            if (!data.tokenAutorizacion) {
              resolve({
                tokenAutorizacion: null
              });
            }
          },
          error: (error) => {
            console.error('ERROR AL OBTENER EL TOKEN DE AUTORIZACIÓN DEL USUARIO: ', error);
            reject(error);
          }
        });
    });
  }

  //MÉTODO QUE EJECUTA TODO EL PROCESO DEL LOGIN:
  async login() {
    this.mensajeNicknameUsuarioDigitadoNulo = "";
    this.mensajePasswordUsuarioDigitadoNulo = "";
    this.mensajeCaptchaUsuarioDigitadoNulo = "";
    this.mensajeCCaptchaDigyCCaptchaGeneradoDiferentes = "";
    this.mensajeError = "";

    //VALIDACIÓN DE CAMPOS VACÍOS:
    if (this.ctextNicknameUsuarioDigitado === "") {
      this.mensajeNicknameUsuarioDigitadoNulo = "Por favor ingresa el usuario.";
    }
    if (this.ctextPasswordUsuarioDigitado === "") {
      this.mensajePasswordUsuarioDigitadoNulo = "Por favor ingresa la contraseña.";
    }
    if (this.ctextCaptchaUsuarioDigitado === "") {
      this.mensajeCaptchaUsuarioDigitadoNulo = "Por favor ingresa el captcha.";
    }

    //VALIDACIÓN DEL CAPTCHA:
    this.banderaCCaptchaDigyCCaptchaGeneradoIguales = 0;//INICIALIZAMOS LA BANDERA EN CERO (0).
    if ((this.ctextCaptchaUsuarioDigitado === this.ctextCodigoCaptchaGenerado) && (!(this.ctextCaptchaUsuarioDigitado === ""))) {
      this.banderaCCaptchaDigyCCaptchaGeneradoIguales = 1;
    }
    if ((this.banderaCCaptchaDigyCCaptchaGeneradoIguales === 0) && (!(this.ctextCaptchaUsuarioDigitado === ""))) {
      this.mensajeCCaptchaDigyCCaptchaGeneradoDiferentes = "El código captcha digitado es diferente.";
    }

    //PROCESO PRINCIPAL DEL LOGIN (SÓLO SI TODOS LOS CAMPOS SON VÁLIDOS):
    if ((!(this.ctextNicknameUsuarioDigitado === "")) && (!(this.ctextPasswordUsuarioDigitado === "")) && (!(this.ctextCaptchaUsuarioDigitado === "")) && (this.banderaCCaptchaDigyCCaptchaGeneradoIguales === 1)) {
      this.cargando = true;

      //PROCESO DE ENCRIPTACIÓN DEL PASSWORD DEL USUARIO:
      this.passwordUsuarioEncriptado = this.ctextPasswordUsuarioDigitado;//INICIALIZACIÓN DEL PASSWORD.
      for (let i = 0; i < 10; i++) {
        this.passwordUsuarioEncriptado = btoa(this.passwordUsuarioEncriptado);
      }

      //LLAMA EL MÉTODO QUE OBTIENE EL TOKEN DE AUTORIZACIÓN DEL USUARIO:
      try {
        const { tokenAutorizacion } = await this.obtenerTokenAutorizacionporNicknameyPassword(this.ctextNicknameUsuarioDigitado, this.passwordUsuarioEncriptado);
        this.tokenAutorizacion = tokenAutorizacion;
      }
      catch (error) {
        console.error('ERROR EN EL PROCESO DE AUTENTICACIÓN: ', error);
        this.mensajeError = "Error de comunicación con el servidor. Inténtalo de nuevo.";
        this.cargando = false;
        return;
      }

      //ASIGNAMOS EL TOKEN DE AUTORIZACIÓN A LA VARIABLE DE SESIÓN (LOCALSTORAGE):
      if (!(this.tokenAutorizacion == null)) {
        localStorage.setItem('tokenAutorizacion', this.tokenAutorizacion);
      }

      //CONSULTA DEL USUARIO EN BASE DE DATOS CON NICKNAME Y PASSWORD ENCRIPTADO:
      this.usuariosService.getUserbyNicknameAndPassword(this.ctextNicknameUsuarioDigitado, this.passwordUsuarioEncriptado).subscribe({
        next: respuesta => {
          if (respuesta.mensaje == "Registro consultado con éxito.") {

            //ALMACENAMOS EN MEMORIA LAS VARIABLES DE SESIÓN Y/O VARIABLES LOCALES DE ALMACENAMIENTO DE LA FUNCIONALIDAD Y ROL ACTUAL DEL SISTEMA:
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('nicknameUsuarioLogueado', this.ctextNicknameUsuarioDigitado);
            //Opcional: puedes encriptar y almacenar la contraseña si lo deseas.
            localStorage.setItem('passwordUsuarioLogueadoEncriptado', this.passwordUsuarioEncriptado);

            localStorage.setItem('idUsuario', String(respuesta.usuarioDTO.idUsuario));
            const segundoApellidoLogueado = respuesta.usuarioDTO.segundoApellidoUsuario ? ` ${respuesta.usuarioDTO.segundoApellidoUsuario}` : '';
            localStorage.setItem('nombreUsuario', `${respuesta.usuarioDTO.nombresUsuario} ${respuesta.usuarioDTO.primerApellidoUsuario}${segundoApellidoLogueado}`);
            localStorage.setItem('nombreFuncionalidad', 'INICIO');//NOMBRE DE LA FUNCIONALIDAD PARA RESTRINGIR EL ACCESO DEL USUARIO DEL SISTEMA.
            localStorage.setItem('nombreRol', 'INICIO');//NOMBRE DEL ROL PARA RESTRINGIR EL ACCESO DEL USUARIO DEL SISTEMA.

            //ESTABLECE EL ACCESO CONCEDIDO EN TRUE PARA MOSTRAR LA ALERTA:
            this.banderaAccesoConcedido = true;
            this.cargando = false;

            //REDIRIGE A LA PÁGINA /INICIO DESPUÉS DE 800 MILISEGUNDOS:
            setTimeout(() => {//DESPUÉS DE LA NAVEGACIÓN.
              this.router.navigate(['/inicio']);
            }, 800);//CAMBIA EL VALOR SEGÚN TU PREFERENCIA (800 MS = 0.8 SEGUNDOS).
          }
          if (respuesta.mensaje == "No se encontró el Registro con el Nickname Proporcionado.") {
            this.mensajeError = respuesta.mensaje;
            this.cargando = false;
          }
          if (respuesta.mensaje == "Contraseña Proporcionada Incorrecta.") {
            this.mensajeError = respuesta.mensaje;
            this.cargando = false;
          }
          if (respuesta.mensaje == "El Usuario esta en estado Inactivo. Consulte con el Administrador del Sistema.") {
            this.mensajeError = respuesta.mensaje;
            this.cargando = false;
          }
        },
        error: (error) => {
          //SE MANEJA EL ERROR HTTP (403, 401, 500, ETC.) DEL BACKEND:
          console.error('ERROR AL CONSULTAR EL USUARIO EN BASE DE DATOS: ', error);
          if (error.status === 403 || error.status === 401) {
            this.mensajeError = "Acceso denegado. Verifique sus credenciales.";
          } else {
            this.mensajeError = "Error de comunicación con el servidor. Inténtalo de nuevo.";
          }
          this.cargando = false;
        }
      });
    }
  }

  //MÉTODO QUE REDIRIGE A LA RECUPERACIÓN DE LA CONTRASEÑA:
  seguimientoOlvidoContrasena(): void {
    //SE REDIRIGE AL USUARIO A LA PÁGINA DE RECUPERACIÓN DE CONTRASEÑA:
    this.router.navigate(['/seguimiento-olvido-contrasena']);//SE IMPORTA EL ENRUTADOR EN EL COMPONENTE.
  }

}
