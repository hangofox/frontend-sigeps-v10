//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

//IMPORTACIÓN DE INTERFACES:
import { HistorialMovimientosEmpleadosI } from '../../../../interfaces/gestion-personal/historial-movimientos-empleados/historialMovimientosEmpleados.interface';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-vista-historial-movimiento-empleado',
  templateUrl: './vista-historial-movimiento-empleado.component.html',
  styleUrls: ['./vista-historial-movimiento-empleado.component.scss']
})
export class VistaHistorialMovimientoEmpleadoComponent implements OnInit {

  @Input() movimientoData: HistorialMovimientosEmpleadosI | null = null;
  @Output() cerrarModal = new EventEmitter<void>();

  movimiento: HistorialMovimientosEmpleadosI | null = null;

  ngOnInit(): void {
    this.movimiento = this.movimientoData;
  }

  closeModal(): void {
    this.cerrarModal.emit();
  }
}
