//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

//IMPORTACIÓN DE INTERFACES:
import { HistorialNovedadesEmpleadosI } from '../../../../interfaces/gestion-personal/historial-novedades-empleados/historialNovedadesEmpleados.interface';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-vista-historial-novedad-empleado',
  templateUrl: './vista-historial-novedad-empleado.component.html',
  styleUrls: ['./vista-historial-novedad-empleado.component.scss']
})
export class VistaHistorialNovedadEmpleadoComponent implements OnInit {

  @Input() novedadData: HistorialNovedadesEmpleadosI | null = null;
  @Output() cerrarModal = new EventEmitter<void>();

  novedad: HistorialNovedadesEmpleadosI | null = null;

  ngOnInit(): void {
    this.novedad = this.novedadData;
  }

  closeModal(): void {
    this.cerrarModal.emit();
  }
}
