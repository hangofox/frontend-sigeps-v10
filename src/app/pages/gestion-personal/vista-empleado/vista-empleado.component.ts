//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

//IMPORTACIÓN DE SERVICIOS:
import { ParametrosSistemaService } from '../../../services/panel-control/parametros-sistema/parametros-sistema.service';
import { GestionArchivosService } from '../../../services/gestion-archivos/gestion-archivos.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-vista-empleado',
  templateUrl: './vista-empleado.component.html',
  styleUrls: ['./vista-empleado.component.scss']
})
export class VistaEmpleadoComponent implements OnInit {

  //ENTRADA DE DATOS DESDE EL COMPONENTE PADRE:
  @Input() empleadoData: any = null;

  //SALIDA DE EVENTOS HACIA EL COMPONENTE PADRE:
  @Output() cerrarModal = new EventEmitter<void>();

  //DATOS DEL EMPLEADO A MOSTRAR:
  empleado: any = null;

  //VISTA PREVIA DE LA FOTO YA ALMACENADA EN EL SERVIDOR DE ARCHIVOS (VER resolverFotoEmpleado):
  previewUrlFotoEmpleado: string | null = null;

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private parametrosSistemaService: ParametrosSistemaService,
    private gestionArchivosService: GestionArchivosService
  ) {}

  ngOnInit(): void {
    this.empleado = this.empleadoData;
    if (this.empleado?.nombreArchivoFotoExtensionOFormatoEmpleado) {
      this.resolverFotoEmpleado(String(this.empleado.nombreArchivoFotoExtensionOFormatoEmpleado));
    }
  }

  //RESUELVE LA URL PÚBLICA DE LA FOTO YA ALMACENADA EN EL SERVIDOR DE ARCHIVOS PARA MOSTRARLA (SI NO HAY FOTO,
  //previewUrlFotoEmpleado QUEDA EN null Y LA PLANTILLA MUESTRA EL ÍCONO GENÉRICO EN SU LUGAR):
  private resolverFotoEmpleado(nombreArchivo: string): void {
    this.parametrosSistemaService.getSystemParameterbyId(1).subscribe({
      next: (respuestaParametros) => {
        const parametrosSistema = respuestaParametros.parametrosSistemaDTO;
        const rutaCompleta = String(parametrosSistema.rutaDestinoCarpetaPrincipalServidorAplicaciones)
          + String(parametrosSistema.rutaDestinoArchivosEmpleados) + nombreArchivo;
        this.gestionArchivosService.getFile(rutaCompleta).subscribe({
          next: (respuestaArchivo) => {
            this.gestionArchivosService.getFileBytes(respuestaArchivo.rutaEstatica).subscribe({
              next: (blob) => { this.previewUrlFotoEmpleado = URL.createObjectURL(blob); },
              error: () => { this.previewUrlFotoEmpleado = null; }
            });
          },
          error: () => { this.previewUrlFotoEmpleado = null; }
        });
      },
      error: (err) => {
        console.error('ERROR AL OBTENER LOS PARÁMETROS DEL SISTEMA PARA LA FOTO DEL EMPLEADO: ', err);
        this.previewUrlFotoEmpleado = null;
      }
    });
  }

  closeModal(): void {
    this.cerrarModal.emit();
  }
}
