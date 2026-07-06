//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

//IMPORTACIÓN DE INTERFACES:
import { AuditoriaSistemaI } from '../../../../interfaces/panel-control/auditorias-sistema/auditoria-sistema.interface';

//IMPORTACIÓN DE SERVICIOS:
import { AuditoriasSistemaService } from '../../../../services/panel-control/auditorias-sistema/auditorias-sistema.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-add-upd-del-auditoria-sistema',
  templateUrl: './add-upd-del-auditoria-sistema.component.html',
  styleUrls: ['./add-upd-del-auditoria-sistema.component.scss']
})
export class AddUpdDelAuditoriaSistemaComponent implements OnInit, OnChanges {

  //ENTRADA DE DATOS DESDE EL COMPONENTE PADRE:
  @Input() modo: string = '';
  @Input() auditoriaSistemaData: AuditoriaSistemaI | null = null;

  //SALIDA DE EVENTOS HACIA EL COMPONENTE PADRE:
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() toastEvento = new EventEmitter<{ tipo: string; mensaje: string }>();

  //DATOS DE LA AUDITORÍA:
  auditoria: AuditoriaSistemaI | null = null;

  //CONTROL DE ESTADO:
  eliminando: boolean = false;

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(private auditoriasSistemaService: AuditoriasSistemaService) {}

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    this.auditoria = this.auditoriaSistemaData;
  }

  //MÉTODO QUE DETECTA CAMBIOS EN LOS INPUTS:
  ngOnChanges(changes: SimpleChanges): void {
    this.auditoria = this.auditoriaSistemaData;
    this.eliminando = false;
  }

  //MÉTODO CRUD — ELIMINAR REGISTRO DE AUDITORÍA:
  accionEliminar(): void {
    if (!this.auditoria?.idAuditoriaSistema) return;
    this.eliminando = true;
    this.auditoriasSistemaService.deleteSystemAudit(this.auditoria.idAuditoriaSistema).subscribe({
      next: (respuesta) => {
        this.toastEvento.emit({ tipo: 'exito', mensaje: respuesta.mensaje || 'Registro de auditoría eliminado correctamente.' });
        this.cerrarModal.emit();
      },
      error: (err) => {
        console.error('ERROR AL ELIMINAR AUDITORÍA: ', err);
        this.eliminando = false;
        this.toastEvento.emit({ tipo: 'error', mensaje: 'Error al eliminar el registro. Verifique la conexión con el servidor.' });
        this.cerrarModal.emit();
      }
    });
  }

  //MÉTODO PARA CERRAR EL MODAL:
  closeModal(): void {
    this.cerrarModal.emit();
  }
}
