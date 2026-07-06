//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

//IMPORTACIÓN DE INTERFACES:
import { PuestoSedeEstablecimientoClienteI } from '../../../../../../interfaces/panel-control/gestion-establecimientos-clientes/sedes-establecimientos-clientes/puestos-sedes-establec-clientes/puestos-sedes-establec-cliente.interface';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-vista-puesto-sede-establec-cliente',
  templateUrl: './vista-puesto-sede-establec-cliente.component.html',
  styleUrls: ['./vista-puesto-sede-establec-cliente.component.scss']
})
export class VistaPuestoSedeEstablecClienteComponent implements OnInit {

  //ENTRADA DE DATOS DESDE EL COMPONENTE PADRE:
  @Input() puestoData: PuestoSedeEstablecimientoClienteI | null = null;

  //SALIDA DE EVENTOS HACIA EL COMPONENTE PADRE:
  @Output() cerrarModal = new EventEmitter<void>();

  //DATOS DEL PUESTO A MOSTRAR:
  puesto: PuestoSedeEstablecimientoClienteI | null = null;

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    this.puesto = this.puestoData;
  }

  //MÉTODO PARA CERRAR EL MODAL:
  closeModal(): void {
    this.cerrarModal.emit();
  }
}
