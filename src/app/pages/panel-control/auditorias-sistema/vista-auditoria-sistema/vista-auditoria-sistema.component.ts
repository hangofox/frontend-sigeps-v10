//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

//IMPORTACIÓN DE INTERFACES:
import { AuditoriaSistemaI } from '../../../../interfaces/panel-control/auditorias-sistema/auditoria-sistema.interface';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-vista-auditoria-sistema',
  templateUrl: './vista-auditoria-sistema.component.html',
  styleUrls: ['./vista-auditoria-sistema.component.scss']
})
export class VistaAuditoriaSistemaComponent implements OnInit, OnChanges {

  //ENTRADA DE DATOS DESDE EL COMPONENTE PADRE:
  @Input() auditoriaSistemaData: AuditoriaSistemaI | null = null;

  //SALIDA DE EVENTOS HACIA EL COMPONENTE PADRE:
  @Output() cerrarModal = new EventEmitter<void>();

  //DATOS DEL REGISTRO A MOSTRAR:
  auditoria: AuditoriaSistemaI | null = null;

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    this.auditoria = this.auditoriaSistemaData;
  }

  //MÉTODO QUE DETECTA CAMBIOS EN LOS INPUTS:
  ngOnChanges(changes: SimpleChanges): void {
    this.auditoria = this.auditoriaSistemaData;
  }

  //MÉTODO PARA CERRAR EL MODAL:
  closeModal(): void {
    this.cerrarModal.emit();
  }

  //MÉTODO PARA OBTENER LA CLASE CSS DEL BADGE DE ACCIÓN:
  getBadgeAccion(accion: string): string {
    const mapa: { [key: string]: string } = {
      'GUARDAR': 'badge-guardar', 'MODIFICAR': 'badge-modificar',
      'ELIMINAR': 'badge-eliminar-accion', 'CONSULTAR': 'badge-consultar',
      'LOGIN': 'badge-login', 'LOGOUT': 'badge-logout'
    };
    return mapa[String(accion).toUpperCase()] || '';
  }
}
