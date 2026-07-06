//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

//IMPORTACIÓN DE INTERFACES:
import { UsuariosI } from '../../../../interfaces/panel-control/usuarios/usuarios.interface';

//IMPORTACIÓN DE SERVICIOS:
import { UsuariosService } from '../../../../services/panel-control/usuarios/usuarios.service';

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
  tamanoArchivoFotoAltura: string = '150px';
  tamanoArchivoFotoAnchura: string = '150px';
  mensajeError: string = '';
  private componenteInicializado: boolean = false;

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private usuariosService: UsuariosService
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
          this.changeDetectorRef.detectChanges();
        },
        error: (err) => {
          console.error('ERROR AL CARGAR DATOS DEL USUARIO PARA VISTA: ', err);
          this.mensajeError = 'Error al cargar los datos del usuario.';
        }
      });
  }

  //MÉTODO PARA CERRAR EL MODAL:
  closeModal(): void {
    this.cerrarModal.emit();
  }
}
