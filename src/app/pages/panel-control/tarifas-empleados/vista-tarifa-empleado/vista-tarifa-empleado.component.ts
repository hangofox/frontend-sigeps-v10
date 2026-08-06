//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

//IMPORTACIÓN DE INTERFACES:
import { TarifasEmpleadosI } from '../../../../interfaces/panel-control/tarifas-empleados/tarifas-empleados.interface';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-vista-tarifa-empleado',
  templateUrl: './vista-tarifa-empleado.component.html',
  styleUrls: ['./vista-tarifa-empleado.component.scss']
})
export class VistaTarifaEmpleadoComponent implements OnInit {

  //ENTRADA DE DATOS DESDE EL COMPONENTE PADRE:
  @Input() tarifaEmpleadoData: TarifasEmpleadosI | null = null;

  //SALIDA DE EVENTOS HACIA EL COMPONENTE PADRE:
  @Output() cerrarModal = new EventEmitter<void>();

  //DATOS DE LA TARIFA DE EMPLEADO A MOSTRAR:
  tarifaEmpleado: TarifasEmpleadosI | null = null;

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    this.tarifaEmpleado = this.tarifaEmpleadoData;
  }

  //MÉTODO PARA CERRAR EL MODAL:
  closeModal(): void {
    this.cerrarModal.emit();
  }
}
