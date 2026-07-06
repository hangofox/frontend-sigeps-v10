//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-vista-establecimiento-cliente',
  templateUrl: './vista-establecimiento-cliente.component.html',
  styleUrls: ['./vista-establecimiento-cliente.component.scss']
})
export class VistaEstablecimientoClienteComponent implements OnInit {

  //ENTRADA DE DATOS DESDE EL COMPONENTE PADRE:
  @Input() establecimientoData: any = null;

  //SALIDA DE EVENTOS HACIA EL COMPONENTE PADRE:
  @Output() cerrarModal = new EventEmitter<void>();

  //DATOS DEL ESTABLECIMIENTO A MOSTRAR:
  establecimiento: any = null;

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    this.establecimiento = this.establecimientoData;
  }

  //MÉTODO PARA CERRAR EL MODAL:
  closeModal(): void {
    this.cerrarModal.emit();
  }
}
