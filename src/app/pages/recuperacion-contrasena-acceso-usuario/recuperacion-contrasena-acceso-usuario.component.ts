//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

//IMPORTACIÓN DE INTERFACES:
import { RecuperacionesContrasenasAccesosUsuariosI } from '../../interfaces/panel-control/parametros-sistema/recuperaciones-contrasenas-accesos-usuarios/recuperacionesContrasenasAccesosUsuarios.interface';

//IMPORTACIÓN DE SERVICIOS:
import { UsuariosService } from '../../services/panel-control/usuarios/usuarios.service';
import { RecuperacionesContrasenasAccesosUsuariosService } from '../../services/panel-control/parametros-sistema/recuperaciones-contrasenas-accesos-usuarios/recuperacionesContrasenasAccesosUsuarios.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-recuperacion-contrasena-acceso-usuario',
  templateUrl: './recuperacion-contrasena-acceso-usuario.component.html',
  styleUrls: ['./recuperacion-contrasena-acceso-usuario.component.scss']
})
export class RecuperacionContrasenaAccesoUsuarioComponent implements OnInit {

  restablecimientoForm!: FormGroup;
  idUsuarioRecibido: number = 0;
  numeroDocumentoIdentificacionUsuarioRecibido: string = '';
  mensajeError: string = '';
  mensajeExito: string = '';
  cargando: boolean = false;

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private usuariosService: UsuariosService,
    private recuperacionesContrasenasAccesosUsuariosService: RecuperacionesContrasenasAccesosUsuariosService
  ) {}

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    //SE OBTIENEN LOS DATOS GUARDADOS POR EL PASO ANTERIOR (SeguimientoOlvidoContrasenaComponent):
    this.idUsuarioRecibido = Number(sessionStorage.getItem('idUsuarioEnviado') || 0);
    this.numeroDocumentoIdentificacionUsuarioRecibido = sessionStorage.getItem('numeroDocumentoIdentificacionUsuarioEnviado') || '';

    //SI INTENTAN ENTRAR DIRECTO A ESTE COMPONENTE (POR EJEMPLO ESCRIBIENDO LA URL) SIN HABER HECHO EL PROCESO
    //DE GENERACIÓN DEL CÓDIGO DE ACTIVACIÓN, SE REDIRIGE AL PASO ANTERIOR:
    if (!this.idUsuarioRecibido || !this.numeroDocumentoIdentificacionUsuarioRecibido) {
      this.router.navigate(['/seguimiento-olvido-contrasena']);
      return;
    }

    this.initForm();
  }

  //MÉTODO DE INICIALIZACIÓN DEL FORMULARIO:
  private initForm(): void {
    this.restablecimientoForm = this.formBuilder.group({
      ctextCodigoActivacionContrasenaAccesoUsuario: new FormControl('', Validators.required),
      ctextPasswordUsuario1: new FormControl('', Validators.required),
      ctextPasswordUsuario2: new FormControl('', Validators.required)
    });
  }

  //MÉTODO QUE OBTIENE EL PASSWORD ENCRIPTADO DEL USUARIO (MISMO PATRÓN QUE LoginComponent):
  private obtenerPasswordUsuarioEncriptado(passwordUsuarioDesencriptado: string): string {
    let passwordUsuarioEncriptado = passwordUsuarioDesencriptado;
    for (let i = 0; i < 10; i++) {
      passwordUsuarioEncriptado = btoa(passwordUsuarioEncriptado);
    }
    return passwordUsuarioEncriptado;
  }

  //DEVUELVE LA FECHA Y HORA LOCAL ACTUAL COMO Date, A PARTIR DEL STRING "yyyy-MM-ddTHH:mm:ss.SSS±HH:mm" DEL BACKEND:
  private aFecha(valor: String | undefined): Date | null {
    if (!valor) return null;
    const fecha = new Date(String(valor));
    return isNaN(fecha.getTime()) ? null : fecha;
  }

  //MÉTODO PRINCIPAL PARA RESTABLECER LA CONTRASEÑA DE ACCESO DEL USUARIO:
  restablecerContrasenaAccesoUsuario(): void {
    if (this.restablecimientoForm.invalid) return;
    this.mensajeError = '';
    this.mensajeExito = '';

    const fv = this.restablecimientoForm.value;

    //VALIDACIÓN: LAS DOS CONTRASEÑAS DEBEN COINCIDIR:
    if (fv.ctextPasswordUsuario1 !== fv.ctextPasswordUsuario2) {
      this.mensajeError = 'La contraseña y la confirmación de contraseña no coinciden.';
      return;
    }

    //VALIDACIÓN DE POLÍTICAS DE SEGURIDAD: MÍNIMO 8 CARACTERES, AL MENOS UNA MAYÚSCULA Y AL MENOS UN NÚMERO:
    const regexPoliticaSeguridad = /^(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    if (!regexPoliticaSeguridad.test(fv.ctextPasswordUsuario1)) {
      this.mensajeError = 'La contraseña debe tener mínimo 8 caracteres, incluir al menos una letra mayúscula y contener letras y números.';
      return;
    }

    this.cargando = true;
    const codigoActivacionDigitado = String(fv.ctextCodigoActivacionContrasenaAccesoUsuario).toUpperCase();

    //SE CONSULTA EL REGISTRO DE RECUPERACIÓN POR EL CÓDIGO DE ACTIVACIÓN DIGITADO:
    this.recuperacionesContrasenasAccesosUsuariosService.getRecoveryPasswordAccessUserbyCodigoActivacion(codigoActivacionDigitado).subscribe({
      next: (respuesta) => {
        const recuperacion = respuesta.recuperacionContrasenaAccesoUsuarioDTO;

        if (respuesta.mensaje !== 'Registro consultado con éxito.' || !recuperacion) {
          this.mensajeError = 'El código de activación digitado no es válido.';
          this.cargando = false;
          return;
        }

        //VERIFICACIÓN DE QUE EL CÓDIGO PERTENECE AL MISMO USUARIO QUE INICIÓ LA RECUPERACIÓN (NO A OTRO USUARIO):
        if (Number(recuperacion.usuarioDTO?.idUsuario) !== this.idUsuarioRecibido) {
          this.mensajeError = 'El código de activación digitado no es válido.';
          this.cargando = false;
          return;
        }

        if (recuperacion.estadoUsoCodigoActivacionContrasenaAccesoUsuario === 'USADO') {
          this.mensajeError = 'El código de activación ya fue usado.';
          this.cargando = false;
          return;
        }

        const fechaExpiracion = this.aFecha(recuperacion.fechaHMSExpCodActivContrasenaAccesoUsuario);
        if (recuperacion.estadoUsoCodigoActivacionContrasenaAccesoUsuario === 'EXPIRADO' || (fechaExpiracion !== null && fechaExpiracion < new Date())) {
          this.mensajeError = 'El código de activación ya expiró.';
          this.cargando = false;
          return;
        }

        //CÓDIGO VÁLIDO: SE ACTUALIZA LA CONTRASEÑA DE ACCESO DEL USUARIO:
        const passwordEncriptado = this.obtenerPasswordUsuarioEncriptado(fv.ctextPasswordUsuario1);
        this.usuariosService.updatePassword(this.idUsuarioRecibido, passwordEncriptado).subscribe({
          next: (respuestaPassword) => {
            if (respuestaPassword.mensaje === 'Acceso de usuario recuperado con éxito. Se actualizó la contraseña de acceso.') {
              //SE MARCA EL CÓDIGO DE ACTIVACIÓN COMO "USADO" PARA QUE NO SE PUEDA VOLVER A UTILIZAR:
              const recuperacionActualizada: RecuperacionesContrasenasAccesosUsuariosI = {
                ...recuperacion,
                estadoUsoCodigoActivacionContrasenaAccesoUsuario: 'USADO'
              };
              this.recuperacionesContrasenasAccesosUsuariosService.updateRecoveryPasswordAccessUser(recuperacionActualizada).subscribe({
                error: (err) => console.error('ERROR AL MARCAR EL CÓDIGO DE ACTIVACIÓN COMO USADO: ', err)
              });

              this.mensajeExito = respuestaPassword.mensaje;
              this.cargando = false;

              //SE LIMPIA LA SESIÓN Y SE REDIRIGE AL LOGIN DESPUÉS DE 3 SEGUNDOS:
              sessionStorage.clear();
              setTimeout(() => {
                this.router.navigate(['/']);
              }, 3000);
            } else {
              this.mensajeError = respuestaPassword.mensaje || 'No fue posible actualizar la contraseña de acceso.';
              this.cargando = false;
            }
          },
          error: (err) => {
            console.error('ERROR AL ACTUALIZAR LA CONTRASEÑA DE ACCESO: ', err);
            this.mensajeError = 'Error de comunicación con el servidor. Intenta nuevamente.';
            this.cargando = false;
          }
        });
      },
      error: (err) => {
        console.error('ERROR AL CONSULTAR EL CÓDIGO DE ACTIVACIÓN: ', err);
        this.mensajeError = 'El código de activación digitado no es válido.';
        this.cargando = false;
      }
    });
  }

  //MÉTODO QUE REDIRIGE AL LOGIN:
  loginUsuario(): void {
    this.router.navigate(['/']);
  }
}
