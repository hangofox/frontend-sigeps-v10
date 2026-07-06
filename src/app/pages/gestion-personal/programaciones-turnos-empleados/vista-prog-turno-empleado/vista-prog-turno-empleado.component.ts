//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

//IMPORTACIÓN DE INTERFACES:
import { ProgramacionTurnoEmpleadoI } from '../../../../interfaces/gestion-personal/programaciones-turnos-empleados/programaciones-turnos-empleados.interface';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-vista-prog-turno-empleado',
  templateUrl: './vista-prog-turno-empleado.component.html',
  styleUrls: ['./vista-prog-turno-empleado.component.scss']
})
export class VistaProgTurnoEmpleadoComponent implements OnInit {

  //ENTRADA DE DATOS DESDE EL COMPONENTE PADRE:
  @Input() programacionData: ProgramacionTurnoEmpleadoI | null = null;

  //SALIDA DE EVENTOS HACIA EL COMPONENTE PADRE:
  @Output() cerrarModal = new EventEmitter<void>();

  //DATOS DE LA PROGRAMACIÓN A MOSTRAR:
  programacion: ProgramacionTurnoEmpleadoI | null = null;

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    this.programacion = this.programacionData;
  }

  //RETORNA EL NOMBRE COMPLETO DEL EMPLEADO DE LA PROGRAMACIÓN:
  get nombreCompletoEmpleado(): string {
    if (!this.programacion) return '';
    const e = this.programacion.empleadoDTO;
    return `${e.nombresEmpleado} ${e.primerApellidoEmpleado} ${e.segundoApellidoEmpleado || ''}`.trim();
  }

  //MÉTODO PARA CERRAR EL MODAL:
  closeModal(): void {
    this.cerrarModal.emit();
  }
}
