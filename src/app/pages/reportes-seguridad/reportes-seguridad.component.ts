//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, OnInit } from '@angular/core';

//IMPORTACIÓN DE INTERFACES:
import { PuestoSedeEstablecimientoClienteI } from '../../interfaces/panel-control/gestion-establecimientos-clientes/sedes-establecimientos-clientes/puestos-sedes-establec-clientes/puestos-sedes-establec-cliente.interface';
import { ProgramacionTurnoEmpleadoI } from '../../interfaces/gestion-personal/programaciones-turnos-empleados/programaciones-turnos-empleados.interface';
import { HistorialMovimientosEmpleadosI } from '../../interfaces/gestion-personal/historial-movimientos-empleados/historialMovimientosEmpleados.interface';

//IMPORTACIÓN DE SERVICIOS:
import { AlertasSeguridadService } from '../../services/reportes-seguridad/alertas-seguridad.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-reportes-seguridad',
  templateUrl: './reportes-seguridad.component.html',
  styleUrls: ['./reportes-seguridad.component.scss']
})
export class ReportesSeguridadComponent implements OnInit {

  cargando: boolean = true;

  //RESULTADOS DE LAS 5 ALERTAS DE SEGURIDAD, CALCULADAS POR AlertasSeguridadService (COMPARTIDO CON InicioComponent
  //PARA QUE EL TOTAL DE LA TARJETA DEL DASHBOARD SIEMPRE COINCIDA CON EL DETALLE DE ESTA PANTALLA):
  alertaPuestosSinCobertura: PuestoSedeEstablecimientoClienteI[] = [];
  alertaPersonalInactivoConTurno: ProgramacionTurnoEmpleadoI[] = [];
  alertaTurnosVencidosSinSalida: HistorialMovimientosEmpleadosI[] = [];
  alertaInasistencias: ProgramacionTurnoEmpleadoI[] = [];
  alertaUbicacionInactivaConTurno: ProgramacionTurnoEmpleadoI[] = [];

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(private alertasSeguridadService: AlertasSeguridadService) {}

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    this.cargarDatos();
  }

  //CONSULTA AL SERVICIO COMPARTIDO LAS 5 ALERTAS DE SEGURIDAD YA CALCULADAS:
  private cargarDatos(): void {
    this.alertasSeguridadService.getSecurityAlerts().subscribe({
      next: (resultado) => {
        this.alertaPuestosSinCobertura = resultado.alertaPuestosSinCobertura;
        this.alertaPersonalInactivoConTurno = resultado.alertaPersonalInactivoConTurno;
        this.alertaTurnosVencidosSinSalida = resultado.alertaTurnosVencidosSinSalida;
        this.alertaInasistencias = resultado.alertaInasistencias;
        this.alertaUbicacionInactivaConTurno = resultado.alertaUbicacionInactivaConTurno;
        this.cargando = false;
      },
      error: (err) => {
        console.error('ERROR AL CALCULAR LAS ALERTAS DE SEGURIDAD: ', err);
        this.cargando = false;
      }
    });
  }

  //TOTAL DE ALERTAS ACTIVAS (PARA EL ENCABEZADO):
  get totalAlertas(): number {
    return this.alertaPuestosSinCobertura.length +
      this.alertaPersonalInactivoConTurno.length +
      this.alertaTurnosVencidosSinSalida.length +
      this.alertaInasistencias.length +
      this.alertaUbicacionInactivaConTurno.length;
  }
}
