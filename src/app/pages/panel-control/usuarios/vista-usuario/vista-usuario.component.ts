//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

//IMPORTACIÓN DE INTERFACES:
import { UsuariosI } from '../../../../interfaces/panel-control/usuarios/usuarios.interface';

//IMPORTACIÓN DE SERVICIOS:
import { UsuariosService } from '../../../../services/panel-control/usuarios/usuarios.service';
import { ParametrosSistemaService } from '../../../../services/panel-control/parametros-sistema/parametros-sistema.service';
import { GestionArchivosService } from '../../../../services/gestion-archivos/gestion-archivos.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-vista-usuario',
  templateUrl: './vista-usuario.component.html',
  styleUrls: ['./vista-usuario.component.scss']
})
export class VistaUsuarioComponent implements OnInit, OnChanges {

  //INPUTS: DATOS DEL USUARIO A VISUALIZAR:
  @Input() usuarioData: any = null;

  //OUTPUT: EVENTO PARA CERRAR EL MODAL:
  @Output() cerrarModal = new EventEmitter<void>();

  //DECLARACIÓN DE VARIABLES GLOBALES:
  banderaCrudVer: boolean = true;
  usuarios!: UsuariosI;
  valorCeldaFotoUsuario: string = 'celda-fondo-imagen-usuario';
  rutaEstaticaArchivoFotoObtenida: string | null = null;
  mensajeError: string = '';
  private componenteInicializado: boolean = false;

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private usuariosService: UsuariosService,
    private parametrosSistemaService: ParametrosSistemaService,
    private gestionArchivosService: GestionArchivosService
  ) {}

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    this.cargarDatosUsuario();
    this.componenteInicializado = true;
  }

  //DETECTA CAMBIOS EN EL @Input Y RECARGA LOS DATOS:
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.componenteInicializado) return;
    if (changes['usuarioData']) {
      this.cargarDatosUsuario();
    }
  }

  //MÉTODO QUE CARGA LOS DATOS DEL USUARIO DESDE EL BACKEND POR ID:
  cargarDatosUsuario(): void {
    if (!this.usuarioData?.idUsuario) return;
    this.mensajeError = '';
    this.usuariosService.getUserbyId(Number(this.usuarioData.idUsuario))
      .subscribe({
        next: (respuesta) => {
          this.usuarios = respuesta.usuarioDTO;
          this.rutaEstaticaArchivoFotoObtenida = null;
          if (this.usuarios.nombreArchivoFotoExtensionoFormatoUsuario) {
            this.resolverFotoUsuario(String(this.usuarios.nombreArchivoFotoExtensionoFormatoUsuario));
          }
          this.changeDetectorRef.detectChanges();
        },
        error: (err) => {
          console.error('ERROR AL CARGAR DATOS DEL USUARIO PARA VISTA: ', err);
          this.mensajeError = 'Error al cargar los datos del usuario.';
        }
      });
  }

  //RESUELVE LA URL PÚBLICA DE LA FOTO YA ALMACENADA EN EL SERVIDOR DE ARCHIVOS PARA MOSTRARLA (SI NO HAY FOTO,
  //rutaEstaticaArchivoFotoObtenida QUEDA EN null Y LA PLANTILLA MUESTRA EL ÍCONO GENÉRICO EN SU LUGAR):
  private resolverFotoUsuario(nombreArchivo: string): void {
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
                if (this.rutaEstaticaArchivoFotoObtenida) URL.revokeObjectURL(this.rutaEstaticaArchivoFotoObtenida);
                this.rutaEstaticaArchivoFotoObtenida = URL.createObjectURL(blob);
                this.changeDetectorRef.detectChanges();
              },
              error: () => { this.rutaEstaticaArchivoFotoObtenida = null; }
            });
          },
          error: () => { this.rutaEstaticaArchivoFotoObtenida = null; }
        });
      },
      error: (err) => {
        console.error('ERROR AL OBTENER LOS PARÁMETROS DEL SISTEMA PARA LA FOTO DEL USUARIO: ', err);
        this.rutaEstaticaArchivoFotoObtenida = null;
      }
    });
  }

  //MÉTODO PARA CERRAR EL MODAL:
  closeModal(): void {
    this.cerrarModal.emit();
  }
}
