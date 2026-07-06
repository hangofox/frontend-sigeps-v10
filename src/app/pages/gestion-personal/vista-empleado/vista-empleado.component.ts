//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

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

  ngOnInit(): void {
    this.empleado = this.empleadoData;
  }

  closeModal(): void {
    this.cerrarModal.emit();
  }
}
