//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { SessionService } from '../../services/session/session.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-menu-principal-lateral-izquierdo',
  templateUrl: './menu-principal-lateral-izquierdo.component.html',
  styleUrls: ['./menu-principal-lateral-izquierdo.component.scss']
})
export class MenuPrincipalLateralIzquierdoComponent implements OnInit, OnChanges {

  //ENTRADA: SECCIÓN ACTIVA RECIBIDA DEL COMPONENTE PADRE:
  @Input() menuActivo: string = 'inicio';

  //SALIDA: EMITE LA NUEVA SECCIÓN CUANDO EL USUARIO HACE CLIC:
  @Output() menuActivoChange = new EventEmitter<string>();

  //SALIDA: EMITE CUANDO EL USUARIO HACE CLIC EN "CERRAR SESIÓN":
  @Output() onCerrarSesion = new EventEmitter<void>();

  //ESTADO DE SUBMENÚS EXPANDIDOS:
  gestionPersonalExpanded: boolean = false;
  reportesEstadisticasExpanded: boolean = false;
  panelControlExpanded: boolean = false;

  //CONSTRUCTOR DEL COMPONENTE (PÚBLICO PARA QUE EL TEMPLATE CONSULTE DIRECTAMENTE LOS PRIVILEGIOS Y RESTRICCIONES DEL USUARIO):
  constructor(public sessionService: SessionService) {}

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    this.sincronizarExpanded(this.menuActivo);
  }

  //DETECTA CAMBIOS EN EL INPUT menuActivo PARA EXPANDIR EL SUBMENÚ CORRECTO:
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['menuActivo']) {
      this.sincronizarExpanded(changes['menuActivo'].currentValue);
    }
  }

  //EXPANDE EL SUBMENÚ CORRESPONDIENTE SEGÚN LA SECCIÓN ACTIVA:
  private sincronizarExpanded(seccion: string): void {
    if (seccion?.startsWith('gestion-personal'))         this.gestionPersonalExpanded      = true;
    if (seccion?.startsWith('reportes-estadisticas'))    this.reportesEstadisticasExpanded = true;
    if (seccion?.startsWith('panel-control'))            this.panelControlExpanded         = true;
  }

  //EMITE LA NUEVA SECCIÓN SELECCIONADA AL COMPONENTE PADRE:
  seleccionar(seccion: string): void {
    this.menuActivoChange.emit(seccion);
  }

  //EMITE EL EVENTO DE CERRAR SESIÓN AL COMPONENTE PADRE:
  cerrarSesion(): void {
    this.onCerrarSesion.emit();
  }
}
