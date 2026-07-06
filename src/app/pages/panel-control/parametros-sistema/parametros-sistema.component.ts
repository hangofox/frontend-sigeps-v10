//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

//IMPORTACIÓN DE INTERFACES:
import { ParametrosSistemaI } from '../../../interfaces/panel-control/parametros-sistema/parametros-sistema.interface';

//IMPORTACIÓN DE SERVICIOS:
import { ParametrosSistemaService } from '../../../services/panel-control/parametros-sistema/parametros-sistema.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-parametros-sistema',
  templateUrl: './parametros-sistema.component.html',
  styleUrls: ['./parametros-sistema.component.scss']
})
export class ParametrosSistemaComponent implements OnInit {

  //DECLARACIÓN DE VARIABLES GLOBALES:
  isLoggedIn: boolean = false;
  nicknameUsuarioLogueado: string | null = null;
  parametrosSistemaForm!: FormGroup;
  mensajeError: string = '';
  cargandoDatos: boolean = false;

  //TOAST:
  toastMensaje: string = '';
  toastTipo: string = '';
  private toastTimer: any = null;

  //EDITOR WYSIWYG:
  @ViewChild('editorHtml') editorHtml!: ElementRef<HTMLDivElement>;
  editorPestanaActiva: 'editor' | 'preview' | 'codigo' = 'editor';
  editorContenidoHtml: string = '';
  codigoFuenteHtml: string = '';

  //PARÁMETROS CARGADOS DESDE EL BACKEND — SE USAN PARA RECONSTRUIR EL DTO AL GUARDAR:
  private parametrosCargados!: ParametrosSistemaI;

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private formBuilder: FormBuilder,
    private parametrosSistemaService: ParametrosSistemaService
  ) {}

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      this.isLoggedIn = true;
      this.nicknameUsuarioLogueado = localStorage.getItem('nicknameUsuarioLogueado');
    }
    this.initForm();
    this.cargarDatos();
  }

  //MÉTODO DE INICIALIZACIÓN DEL FORMULARIO VACÍO (ESPERA LOS DATOS DEL BACKEND):
  initForm(): void {
    this.parametrosSistemaForm = this.formBuilder.group({
      ctextIdParametrosSistema: new FormControl(''),
      ctextTiempoMinutosSesionInactivaSistema: new FormControl('', Validators.required),
      ctextTiempoMinutosValidezCodigoActivacionSistema: new FormControl('', Validators.required),
      ctextRutaDestinoCarpetaPrincipalServidorAplicaciones: new FormControl('', Validators.required),
      ctextRutaDestinoCarpetaCargueTemporalArchivos: new FormControl('', Validators.required),
      ctextRutaDestinoArchivosUsuarios: new FormControl('', Validators.required),
      ctextRutaDestinoArchivosEmpleados: new FormControl('', Validators.required),
      cboxAuthEnableSeleccionado: new FormControl(''),
      cboxStartTtlsEnableSeleccionado: new FormControl(''),
      ctextSmtpHost: new FormControl(''),
      ctextSmtpPort: new FormControl(''),
      ctextSmtpProtocols: new FormControl(''),
      ctextUsuarioRemitente: new FormControl(''),
      ctextPasswordRemitente: new FormControl(''),
      ctextCorreoElectronicoRemitente: new FormControl(''),
      ctextAsuntoDestinatarioRecuperacionContrasena: new FormControl(''),
      ctextMultilineaCuerpoMensajeHtmlRecuperacionContrasena: new FormControl('')
    });
  }

  //CARGA LOS PARÁMETROS DEL SISTEMA DESDE EL BACKEND (REGISTRO ÚNICO CON ID 1):
  cargarDatos(): void {
    this.cargandoDatos = true;
    this.mensajeError = '';
    this.parametrosSistemaService.getSystemParameterbyId(1).subscribe({
      next: (respuesta) => {
        this.parametrosCargados = respuesta.parametrosSistemaDTO;
        this.cargandoDatos = false;
        this.chargueForm();
      },
      error: (err) => {
        this.cargandoDatos = false;
        console.error('ERROR AL CARGAR PARÁMETROS DEL SISTEMA: ', err);
        this.mensajeError = 'Error al cargar los parámetros del sistema. Verifique la conexión con el servidor.';
      }
    });
  }

  //PUEBLA EL FORMULARIO CON LOS DATOS TRAÍDOS DEL BACKEND:
  chargueForm(): void {
    const p = this.parametrosCargados;
    const htmlCuerpo = String(p.cuerpoMensajeHtmlRecuperacionContrasena || '');
    this.editorContenidoHtml = htmlCuerpo;
    this.parametrosSistemaForm.patchValue({
      ctextIdParametrosSistema: p.idParametrosSistema || '',
      ctextTiempoMinutosSesionInactivaSistema: p.tiempoMinutosSesionInactivaSistema || '',
      ctextTiempoMinutosValidezCodigoActivacionSistema: p.tiempoMinutosValidezCodigoActivacionSistema || '',
      ctextRutaDestinoCarpetaPrincipalServidorAplicaciones: p.rutaDestinoCarpetaPrincipalServidorAplicaciones || '',
      ctextRutaDestinoCarpetaCargueTemporalArchivos: p.rutaDestinoCarpetaCargueTemporalArchivos || '',
      ctextRutaDestinoArchivosUsuarios: p.rutaDestinoArchivosUsuarios || '',
      ctextRutaDestinoArchivosEmpleados: p.rutaDestinoArchivosEmpleados || '',
      cboxAuthEnableSeleccionado: p.authEnable || '',
      cboxStartTtlsEnableSeleccionado: p.startTtlsEnable || '',
      ctextSmtpHost: p.smtpHost || '',
      ctextSmtpPort: p.smtpPort || '',
      ctextSmtpProtocols: p.smtpProtocols || '',
      ctextUsuarioRemitente: p.usuarioRemitente || '',
      ctextPasswordRemitente: p.passwordRemitente || '',
      ctextCorreoElectronicoRemitente: p.correoElectronicoRemitente || '',
      ctextAsuntoDestinatarioRecuperacionContrasena: p.asuntoDestinatarioRecuperacionContrasena || '',
      ctextMultilineaCuerpoMensajeHtmlRecuperacionContrasena: htmlCuerpo
    });
  }

  // ─── EDITOR WYSIWYG ─────────────────────────────────────────────────────────

  //CAMBIA DE PESTAÑA SINCRONIZANDO EL CONTENIDO ENTRE MODOS:
  cambiarPestana(pestana: 'editor' | 'preview' | 'codigo'): void {
    //AL SALIR DEL MODO CÓDIGO FUENTE: sincroniza el textarea al editor:
    if (this.editorPestanaActiva === 'codigo') {
      this.editorContenidoHtml = this.codigoFuenteHtml;
      this.parametrosSistemaForm.get('ctextMultilineaCuerpoMensajeHtmlRecuperacionContrasena')
        ?.setValue(this.codigoFuenteHtml, { emitEvent: false });
    }
    //AL ENTRAR AL MODO CÓDIGO FUENTE: carga el HTML actual:
    if (pestana === 'codigo') {
      this.codigoFuenteHtml = this.editorContenidoHtml;
    }
    this.editorPestanaActiva = pestana;
  }

  //SINCRONIZA EL CONTENIDO DEL DIV CONTENTEDITABLE CON EL CAMPO DEL FORMULARIO:
  sincronizarEditor(): void {
    if (this.editorHtml?.nativeElement) {
      const html = this.editorHtml.nativeElement.innerHTML;
      this.editorContenidoHtml = html;
      this.parametrosSistemaForm.get('ctextMultilineaCuerpoMensajeHtmlRecuperacionContrasena')?.setValue(html, { emitEvent: false });
    }
  }

  //SINCRONIZA EL TEXTAREA DE CÓDIGO FUENTE CON EL FORMULARIO EN TIEMPO REAL:
  sincronizarCodigoFuente(html: string): void {
    this.codigoFuenteHtml = html;
    this.parametrosSistemaForm.get('ctextMultilineaCuerpoMensajeHtmlRecuperacionContrasena')
      ?.setValue(html, { emitEvent: false });
  }

  //APLICA UN COMANDO DE FORMATO AL TEXTO SELECCIONADO:
  formatear(comando: string): void {
    document.execCommand(comando, false, undefined);
    this.sincronizarEditor();
  }

  //APLICA UN COMANDO CON VALOR (TAMAÑO, COLOR):
  formatearConValor(comando: string, valor: string): void {
    if (!valor) return;
    document.execCommand(comando, false, valor);
    this.sincronizarEditor();
  }

  //INSERTA UN HIPERVÍNCULO EN EL TEXTO SELECCIONADO:
  insertarEnlace(): void {
    const url = prompt('Ingrese la URL del enlace:');
    if (url) {
      document.execCommand('createLink', false, url);
      this.sincronizarEditor();
    }
  }

  // ─── CRUD ────────────────────────────────────────────────────────────────────

  //MÉTODO CRUD — MODIFICAR LOS PARÁMETROS DEL SISTEMA:
  accionModificarRegistro(): void {
    this.mensajeError = '';

    if (this.parametrosSistemaForm.invalid) {
      this.mensajeError = 'Complete todos los campos obligatorios antes de guardar.';
      return;
    }

    const fv = this.parametrosSistemaForm.getRawValue();

    const parametrosActualizados: ParametrosSistemaI = {
      idParametrosSistema: Number(fv.ctextIdParametrosSistema),
      tiempoMinutosSesionInactivaSistema: Number(fv.ctextTiempoMinutosSesionInactivaSistema),
      tiempoMinutosValidezCodigoActivacionSistema: Number(fv.ctextTiempoMinutosValidezCodigoActivacionSistema),
      rutaDestinoCarpetaPrincipalServidorAplicaciones: fv.ctextRutaDestinoCarpetaPrincipalServidorAplicaciones,
      rutaDestinoCarpetaCargueTemporalArchivos: fv.ctextRutaDestinoCarpetaCargueTemporalArchivos,
      rutaDestinoArchivosUsuarios: fv.ctextRutaDestinoArchivosUsuarios,
      rutaDestinoArchivosEmpleados: fv.ctextRutaDestinoArchivosEmpleados,
      authEnable: fv.cboxAuthEnableSeleccionado,
      startTtlsEnable: fv.cboxStartTtlsEnableSeleccionado,
      smtpHost: fv.ctextSmtpHost,
      smtpPort: fv.ctextSmtpPort,
      smtpProtocols: fv.ctextSmtpProtocols,
      usuarioRemitente: fv.ctextUsuarioRemitente,
      passwordRemitente: fv.ctextPasswordRemitente,
      correoElectronicoRemitente: fv.ctextCorreoElectronicoRemitente,
      asuntoDestinatarioRecuperacionContrasena: fv.ctextAsuntoDestinatarioRecuperacionContrasena,
      cuerpoMensajeHtmlRecuperacionContrasena: fv.ctextMultilineaCuerpoMensajeHtmlRecuperacionContrasena
    };

    this.parametrosSistemaService.updateSystemParameter(parametrosActualizados).subscribe({
      next: (respuesta) => {
        this.mostrarToast('exito', respuesta.mensaje || 'Parámetros del sistema actualizados con éxito.');
        this.cargarDatos();
      },
      error: (err) => {
        console.error('ERROR AL MODIFICAR PARÁMETROS DEL SISTEMA: ', err);
        this.mostrarToast('error', 'Error al actualizar los parámetros del sistema. Verifique la conexión con el servidor.');
      }
    });
  }

  //MUESTRA EL TOAST DE NOTIFICACIÓN:
  mostrarToast(tipo: string, mensaje: string): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTipo = tipo;
    this.toastMensaje = mensaje;
    this.toastTimer = setTimeout(() => { this.toastMensaje = ''; }, 4000);
  }
}
