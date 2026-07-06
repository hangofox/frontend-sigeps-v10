//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

//IMPORTACIÓN DE INTERFACES:
import { UsuariosI } from '../../interfaces/panel-control/usuarios/usuarios.interface';
import { RecuperacionesContrasenasAccesosUsuariosI } from '../../interfaces/panel-control/parametros-sistema/recuperaciones-contrasenas-accesos-usuarios/recuperacionesContrasenasAccesosUsuarios.interface';
import { EmailsI } from '../../interfaces/panel-control/parametros-sistema/correos-electronicos/emails.interface';

//IMPORTACIÓN DE SERVICIOS:
import { UsuariosService } from '../../services/panel-control/usuarios/usuarios.service';
import { ParametrosSistemaService } from '../../services/panel-control/parametros-sistema/parametros-sistema.service';
import { RecuperacionesContrasenasAccesosUsuariosService } from '../../services/panel-control/parametros-sistema/recuperaciones-contrasenas-accesos-usuarios/recuperacionesContrasenasAccesosUsuarios.service';
import { EmailsService } from '../../services/panel-control/parametros-sistema/correos-electronicos/emails.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-seguimiento-olvido-contrasena',
  templateUrl: './seguimiento-olvido-contrasena.component.html',
  styleUrls: ['./seguimiento-olvido-contrasena.component.scss']
})
export class SeguimientoOlvidoContrasenaComponent {

  //PASO 1 — BÚSQUEDA DEL USUARIO:
  ctextNumeroDocumentoIdentificacionUsuarioDigitado: string = '';
  mensajeNumeroDocumentoIdentificacionNulo: string = '';
  mensajeError: string = '';
  banderaRegistroConsultadoExitoso: boolean = false;
  usuario!: UsuariosI;

  //PASO 2 — ENVÍO DEL MENSAJE CON EL CÓDIGO DE ACTIVACIÓN:
  envioMensajeForm!: FormGroup;
  spinnerEnvioMensaje: boolean = false;
  banderaHabilitacionBotonEnviarMensaje: boolean = true;

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private usuariosService: UsuariosService,
    private parametrosSistemaService: ParametrosSistemaService,
    private recuperacionesContrasenasAccesosUsuariosService: RecuperacionesContrasenasAccesosUsuariosService,
    private emailsService: EmailsService
  ) {
    this.initForm();

    //ACTUALIZA A "EXPIRADO" LOS CÓDIGOS "PENDIENTE DE USO" DE TODOS LOS USUARIOS CUYA FECHA DE EXPIRACIÓN YA
    //PASÓ, PARA QUE LA BASE DE DATOS REFLEJE EL ESTADO REAL Y NO QUEDEN CÓDIGOS VENCIDOS MARCADOS COMO VIGENTES:
    this.recuperacionesContrasenasAccesosUsuariosService.updateStatesUsesCodesActivationsPasswordsAccessUsersRecoveriesPasswordsAccessUsers(this.obtenerFechaHoraIso(new Date())).subscribe({
      error: (err) => console.error('ERROR AL ACTUALIZAR ESTADOS DE CÓDIGOS DE ACTIVACIÓN VENCIDOS: ', err)
    });
  }

  //MÉTODO DE INICIALIZACIÓN DEL FORMULARIO DE ENVÍO DE MENSAJE:
  private initForm(): void {
    this.envioMensajeForm = this.formBuilder.group({
      ctextIdUsuario: new FormControl(''),
      cboxMedioEnvioMensajeSeleccionado: new FormControl('MEDIO DE ENVÍO', [Validators.required, this.medioEnvioValidador])
    });
  }

  //VALIDADOR QUE EXIGE QUE SE HAYA ELEGIDO UN MEDIO DE ENVÍO REAL (NO LA OPCIÓN PLACEHOLDER):
  medioEnvioValidador(control: FormControl): { [key: string]: boolean } | null {
    return control.value === 'MEDIO DE ENVÍO' ? { invalidMedioEnvio: true } : null;
  }

  //DEVUELVE LA FECHA/HORA EN FORMATO ISO-8601 CON MILISEGUNDOS Y OFFSET (yyyy-MM-ddTHH:mm:ss.SSS±HH:mm), EL
  //MISMO FORMATO QUE EXIGE EL BACKEND PARA CAMPOS java.util.Date (VER AuditoriasSistemaService.registrarAuditoria):
  private obtenerFechaHoraIso(fecha: Date): string {
    const dosDigitos = (valor: number): string => String(valor).padStart(2, '0');
    const fechaTexto = `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
    const horaTexto = `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}:${dosDigitos(fecha.getSeconds())}`;
    const milisegundos = String(fecha.getMilliseconds()).padStart(3, '0');
    const offsetMinutosTotal = -fecha.getTimezoneOffset();
    const signoOffset = offsetMinutosTotal >= 0 ? '+' : '-';
    const offsetHoras = dosDigitos(Math.floor(Math.abs(offsetMinutosTotal) / 60));
    const offsetMinutos = dosDigitos(Math.abs(offsetMinutosTotal) % 60);
    return `${fechaTexto}T${horaTexto}.${milisegundos}${signoOffset}${offsetHoras}:${offsetMinutos}`;
  }

  //CALCULA LA FECHA/HORA DE EXPIRACIÓN DEL CÓDIGO DE ACTIVACIÓN SUMÁNDOLE LOS MINUTOS DE VALIDEZ CONFIGURADOS EN
  //PARÁMETROS DEL SISTEMA A LA FECHA/HORA ACTUAL:
  private calcularFechaHMSExpiracion(minutosValidez: number): string {
    return this.obtenerFechaHoraIso(new Date(Date.now() + minutosValidez * 60 * 1000));
  }

  //ENMASCARA UN DATO SENSIBLE DEJANDO SOLO LOS ÚLTIMOS CARACTERES VISIBLES:
  private enmascararDato(dato: String | undefined): string {
    const valor = String(dato || '');
    if (valor.length <= 5) return 'xxxxx';
    return 'xxxxx' + valor.slice(5);
  }

  //GENERA UN CÓDIGO DE ACTIVACIÓN NUMÉRICO DE 6 DÍGITOS:
  private generadorCodigoActivacion(): string {
    const caracteres = '0123456789';
    let resultado = '';
    for (let i = 0; i < 6; i++) {
      resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return resultado;
  }

  //MÉTODO QUE REALIZA LA BÚSQUEDA DEL USUARIO DEL SISTEMA POR NÚMERO DE DOCUMENTO DE IDENTIFICACIÓN:
  busquedaUsuarioRecuperacionContrasenaAcceso(): void {
    this.mensajeNumeroDocumentoIdentificacionNulo = '';
    this.mensajeError = '';

    if (this.ctextNumeroDocumentoIdentificacionUsuarioDigitado === '') {
      this.mensajeNumeroDocumentoIdentificacionNulo = 'Por favor ingresa el número de documento de identificación.';
      return;
    }

    this.usuariosService.getRecoveryPasswordAccessUserbyNumeroDocumentoIdentificacion(this.ctextNumeroDocumentoIdentificacionUsuarioDigitado).subscribe({
      next: (respuesta) => {
        if (respuesta.mensaje === 'Registro consultado con éxito.') {
          const usuarioReal = respuesta.usuarioDTO;

          this.envioMensajeForm.patchValue({ ctextIdUsuario: usuarioReal.idUsuario });

          //SE ENMASCARAN LOS DATOS SENSIBLES ANTES DE MOSTRARLOS EN PANTALLA (LOS VALORES REALES YA QUEDARON GUARDADOS EN EL FORMULARIO):
          this.usuario = {
            ...usuarioReal,
            correoElectronicoInstitucionalUsuario: usuarioReal.correoElectronicoInstitucionalUsuario ? this.enmascararDato(usuarioReal.correoElectronicoInstitucionalUsuario) : usuarioReal.correoElectronicoInstitucionalUsuario,
            correoElectronicoPersonalUsuario: this.enmascararDato(usuarioReal.correoElectronicoPersonalUsuario)
          };

          this.banderaRegistroConsultadoExitoso = true;
        } else {
          this.mensajeError = respuesta.mensaje || 'No se encontró el usuario con el número de documento proporcionado.';
        }
      },
      error: (err) => {
        console.error('ERROR AL CONSULTAR EL USUARIO: ', err);
        this.mensajeError = 'Error de comunicación con el servidor. Inténtalo de nuevo.';
      }
    });
  }

  //MÉTODO PARA ENVIAR EL CÓDIGO DE ACTIVACIÓN POR EL MEDIO ELEGIDO (INSTITUCIONAL O PERSONAL):
  enviarMensaje(): void {
    if (this.envioMensajeForm.invalid || !this.banderaHabilitacionBotonEnviarMensaje) return;

    const fv = this.envioMensajeForm.value;
    this.mensajeError = '';
    this.spinnerEnvioMensaje = true;
    //SE DESHABILITA EL BOTÓN PARA EVITAR ENVÍOS MÚLTIPLES MIENTRAS SE CONFIRMA EL PRIMERO:
    this.banderaHabilitacionBotonEnviarMensaje = false;

    const medioEnvio = fv.cboxMedioEnvioMensajeSeleccionado === 'INSTITUCIONAL' ? 'INSTITUCIONAL' : 'PERSONAL';

    //SE VACÍAN LOS CÓDIGOS DE RECUPERACIÓN ANTERIORES DE ESTE USUARIO PARA QUE SOLO EL NUEVO CÓDIGO SEA VÁLIDO.
    //SE ESPERA A QUE ESTE PASO TERMINE ANTES DE CONTINUAR (EN VEZ DE DISPARARLO EN PARALELO), PARA EVITAR QUE
    //EL DELETE LLEGUE TARDE Y BORRE EL REGISTRO NUEVO QUE VAMOS A CREAR A CONTINUACIÓN:
    this.recuperacionesContrasenasAccesosUsuariosService.toEmptyRecoveriesPasswordsAccessUsersbyIdUsuario(Number(fv.ctextIdUsuario)).subscribe({
      next: () => this.consultarParametrosYGuardarRecuperacion(fv, medioEnvio),
      error: (err) => {
        console.error('ERROR AL VACIAR RECUPERACIONES ANTERIORES DEL USUARIO: ', err);
        //AUNQUE FALLE EL VACIADO (POR EJEMPLO, PORQUE NO HABÍA REGISTROS PREVIOS), SE CONTINÚA CON EL FLUJO:
        this.consultarParametrosYGuardarRecuperacion(fv, medioEnvio);
      }
    });
  }

  //CONSULTA EL TIEMPO DE EXPIRACIÓN DEL CÓDIGO, GENERA EL CÓDIGO, CREA EL REGISTRO DE RECUPERACIÓN Y PIDE EL
  //ENVÍO DEL CORREO. SE LLAMA SOLO DESPUÉS DE QUE vaciarPorIdUsuario() TERMINÓ, PARA GARANTIZAR QUE EL CÓDIGO
  //QUE QUEDA GUARDADO EN BASE DE DATOS ES EXACTAMENTE EL MISMO QUE SE ENVÍA POR CORREO:
  private consultarParametrosYGuardarRecuperacion(fv: any, medioEnvio: string): void {
    const codigoActivacionGenerado = this.generadorCodigoActivacion();

    //SE CONSULTA EL TIEMPO DE EXPIRACIÓN DEL CÓDIGO EN PARÁMETROS DEL SISTEMA (ÚNICO DATO NO SENSIBLE QUE
    //NECESITA EL FRONTEND; EL CORREO DE DESTINO, EL NÚMERO DE DOCUMENTO, LOS DATOS SMTP Y LA PLANTILLA DEL
    //CORREO LOS RESUELVE EL BACKEND INTERNAMENTE AL ENVIAR):
    this.parametrosSistemaService.getPasswordRecoveryPublicDataSystemParameter().subscribe({
      next: (respuestaParametros) => {
        const parametros = respuestaParametros.parametrosSistemaRecuperacionContrasenaDTO;
        if (!parametros) {
          this.mensajeError = 'No fue posible obtener la configuración del sistema.';
          this.spinnerEnvioMensaje = false;
          this.banderaHabilitacionBotonEnviarMensaje = true;
          return;
        }

        const fechaHMSExpCodActivContrasenaAccesoUsuario = this.calcularFechaHMSExpiracion(
          Number(parametros.tiempoMinutosValidezCodigoActivacionSistema)
        );

        //SE CREA EL REGISTRO DE RECUPERACIÓN CON EL CÓDIGO DE ACTIVACIÓN Y SU FECHA DE EXPIRACIÓN:
        const recuperacion: RecuperacionesContrasenasAccesosUsuariosI = {
          usuarioDTO: { idUsuario: Number(fv.ctextIdUsuario) } as UsuariosI,
          codigoActivacionContrasenaAccesoUsuario: codigoActivacionGenerado,
          fechaHMSExpCodActivContrasenaAccesoUsuario,
          estadoUsoCodigoActivacionContrasenaAccesoUsuario: 'PENDIENTE DE USO'
        };

        this.recuperacionesContrasenasAccesosUsuariosService.addRecoveryPasswordAccessUser(recuperacion).subscribe({
          next: (respuestaRecuperacion) => {
            if (respuestaRecuperacion.mensaje !== 'Registro creado con éxito.') {
              console.error('ERROR AL CREAR EL REGISTRO DE RECUPERACIÓN: ', respuestaRecuperacion.mensaje);
              this.mensajeError = 'No fue posible generar el código de activación. Intenta nuevamente.';
              this.spinnerEnvioMensaje = false;
              this.banderaHabilitacionBotonEnviarMensaje = true;
              return;
            }

            //SE PIDE AL BACKEND QUE ENVÍE EL CORREO: SOLO SE MANDAN idUsuario Y medioEnvio (NADA SENSIBLE). EL
            //BACKEND (EmailServiceImpl) RESUELVE INTERNAMENTE EL CORREO DE DESTINO, EL NÚMERO DE DOCUMENTO Y EL
            //CÓDIGO QUE ACABAMOS DE GUARDAR ARRIBA (EL MISMO codigoActivacionGenerado), Y ARMA+ENVÍA EL MENSAJE:
            const email: EmailsI = { idUsuario: Number(fv.ctextIdUsuario), medioEnvio };

            this.emailsService.sendEmail(email).subscribe({
              next: (respuestaEmail) => {
                this.spinnerEnvioMensaje = false;
                if (respuestaEmail.mensaje === 'Correo Electrónico enviado con éxito.') {
                  //SE GUARDAN EN sessionStorage LOS DATOS QUE NECESITA EL SIGUIENTE PASO PARA VALIDAR EL CÓDIGO:
                  sessionStorage.setItem('idUsuarioEnviado', String(fv.ctextIdUsuario));
                  sessionStorage.setItem('numeroDocumentoIdentificacionUsuarioEnviado', this.ctextNumeroDocumentoIdentificacionUsuarioDigitado);

                  setTimeout(() => {
                    this.router.navigate(['/recuperacion-contrasena-acceso-usuario']);
                  }, 1000);
                } else {
                  this.mensajeError = respuestaEmail.mensaje || 'No fue posible enviar el correo electrónico.';
                  this.banderaHabilitacionBotonEnviarMensaje = true;
                }
              },
              error: (err) => {
                console.error('ERROR AL ENVIAR EL CORREO ELECTRÓNICO: ', err);
                this.mensajeError = 'Error al enviar el correo electrónico. Intenta nuevamente.';
                this.spinnerEnvioMensaje = false;
                this.banderaHabilitacionBotonEnviarMensaje = true;
              }
            });
          },
          error: (err) => {
            console.error('ERROR AL CREAR EL REGISTRO DE RECUPERACIÓN: ', err);
            this.mensajeError = 'Error de comunicación con el servidor. Intenta nuevamente.';
            this.spinnerEnvioMensaje = false;
            this.banderaHabilitacionBotonEnviarMensaje = true;
          }
        });
      },
      error: (err) => {
        console.error('ERROR AL CONSULTAR LOS PARÁMETROS DEL SISTEMA: ', err);
        this.mensajeError = 'Error de comunicación con el servidor. Intenta nuevamente.';
        this.spinnerEnvioMensaje = false;
        this.banderaHabilitacionBotonEnviarMensaje = true;
      }
    });
  }

  //MÉTODO QUE REDIRIGE AL LOGIN:
  loginUsuario(): void {
    this.router.navigate(['/']);
  }
}
