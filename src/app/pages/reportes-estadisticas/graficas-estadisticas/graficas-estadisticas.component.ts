//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';

//IMPORTACIÓN DE LA LIBRERÍA DE GRÁFICAS:
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

//IMPORTACIÓN DE SERVICIOS:
import { EmpleadosService } from '../../../services/gestion-personal/empleados/empleados.service';
import { EstablecimientosClientesService } from '../../../services/panel-control/gestion-establecimientos-clientes/establecimientosClientes.service';
import { SedesEstablecimientosClientesService } from '../../../services/panel-control/gestion-establecimientos-clientes/sedes-establecimientos-clientes/sedesEstablecimientosClientes.service';
import { PuestosSedesEstablecimientosClientesService } from '../../../services/panel-control/gestion-establecimientos-clientes/sedes-establecimientos-clientes/puestos-sedes-establec-cliente/puestosSedesEstablecimientosClientes.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-graficas-estadisticas',
  templateUrl: './graficas-estadisticas.component.html',
  styleUrls: ['./graficas-estadisticas.component.scss']
})
export class GraficasEstadisticasComponent implements AfterViewInit, OnDestroy {

  //REFERENCIAS A LOS ELEMENTOS <canvas> DE CADA GRÁFICA:
  @ViewChild('graficaEmpleados') graficaEmpleadosRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('graficaEstablecimientos') graficaEstablecimientosRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('graficaSedes') graficaSedesRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('graficaPuestos') graficaPuestosRef!: ElementRef<HTMLCanvasElement>;

  //TOTALES DE EMPLEADOS:
  totalEmpleados: number = 0;
  totalEmpleadosActivos: number = 0;
  totalEmpleadosInactivos: number = 0;

  //TOTALES DE ESTABLECIMIENTOS CLIENTES:
  totalEstablecimientos: number = 0;
  totalEstablecimientosActivos: number = 0;
  totalEstablecimientosInactivos: number = 0;

  //TOTALES DE SEDES DE ESTABLECIMIENTOS CLIENTES:
  totalSedes: number = 0;
  totalSedesActivas: number = 0;
  totalSedesInactivas: number = 0;

  //TOTALES DE PUESTOS DE SEDES DE ESTABLECIMIENTOS CLIENTES:
  totalPuestos: number = 0;
  totalPuestosActivos: number = 0;
  totalPuestosInactivos: number = 0;

  //INSTANCIAS DE LAS GRÁFICAS (SE DESTRUYEN AL SALIR DEL COMPONENTE):
  private graficas: Chart[] = [];

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private empleadosService: EmpleadosService,
    private establecimientosClientesService: EstablecimientosClientesService,
    private sedesEstablecimientosClientesService: SedesEstablecimientosClientesService,
    private puestosSedesEstablecimientosClientesService: PuestosSedesEstablecimientosClientesService
  ) {}

  //MÉTODO PRINCIPAL DEL COMPONENTE — SE EJECUTA CUANDO LOS <canvas> YA ESTÁN EN EL DOM:
  ngAfterViewInit(): void {
    this.cargarEstadisticasEmpleados();
    this.cargarEstadisticasEstablecimientos();
    this.cargarEstadisticasSedes();
    this.cargarEstadisticasPuestos();
  }

  //DESTRUYE LAS INSTANCIAS DE LAS GRÁFICAS AL DESTRUIR EL COMPONENTE (EVITA FUGAS DE MEMORIA):
  ngOnDestroy(): void {
    this.graficas.forEach(g => g.destroy());
  }

  //CARGA EL TOTAL DE EMPLEADOS ACTIVOS E INACTIVOS Y DIBUJA LA GRÁFICA:
  cargarEstadisticasEmpleados(): void {
    this.empleadosService.findCountTotalRegisters().subscribe({
      next: (total) => {
        this.totalEmpleados = total;
        this.empleadosService.findCountTotalRegisters(undefined, 'INACTIVO').subscribe({
          next: (inactivos) => {
            this.totalEmpleadosInactivos = inactivos;
            this.totalEmpleadosActivos = total - inactivos;
            this.dibujarGrafica(this.graficaEmpleadosRef, 'Empleados', this.totalEmpleadosActivos, this.totalEmpleadosInactivos, '#0ea5e9');
          },
          error: (err) => console.error('ERROR AL CONTAR EMPLEADOS INACTIVOS: ', err)
        });
      },
      error: (err) => console.error('ERROR AL CONTAR TOTAL EMPLEADOS: ', err)
    });
  }

  //CARGA EL TOTAL DE ESTABLECIMIENTOS CLIENTES ACTIVOS E INACTIVOS Y DIBUJA LA GRÁFICA:
  cargarEstadisticasEstablecimientos(): void {
    this.establecimientosClientesService.findCountTotalRegisters().subscribe({
      next: (total) => {
        this.totalEstablecimientos = total;
        this.establecimientosClientesService.findCountTotalRegisters(undefined, 'INACTIVO').subscribe({
          next: (inactivos) => {
            this.totalEstablecimientosInactivos = inactivos;
            this.totalEstablecimientosActivos = total - inactivos;
            this.dibujarGrafica(this.graficaEstablecimientosRef, 'Establecimientos Clientes', this.totalEstablecimientosActivos, this.totalEstablecimientosInactivos, '#059669');
          },
          error: (err) => console.error('ERROR AL CONTAR ESTABLECIMIENTOS INACTIVOS: ', err)
        });
      },
      error: (err) => console.error('ERROR AL CONTAR TOTAL ESTABLECIMIENTOS: ', err)
    });
  }

  //CARGA EL TOTAL DE SEDES ACTIVAS E INACTIVAS (DE TODOS LOS ESTABLECIMIENTOS) Y DIBUJA LA GRÁFICA:
  cargarEstadisticasSedes(): void {
    this.sedesEstablecimientosClientesService.findCountTotalRegisters().subscribe({
      next: (total) => {
        this.totalSedes = total;
        this.sedesEstablecimientosClientesService.findCountTotalRegisters(undefined, 'INACTIVO').subscribe({
          next: (inactivas) => {
            this.totalSedesInactivas = inactivas;
            this.totalSedesActivas = total - inactivas;
            this.dibujarGrafica(this.graficaSedesRef, 'Sedes de Establecimientos Clientes', this.totalSedesActivas, this.totalSedesInactivas, '#f59e0b');
          },
          error: (err) => console.error('ERROR AL CONTAR SEDES INACTIVAS: ', err)
        });
      },
      error: (err) => console.error('ERROR AL CONTAR TOTAL SEDES: ', err)
    });
  }

  //CARGA EL TOTAL DE PUESTOS ACTIVOS E INACTIVOS (DE TODAS LAS SEDES) Y DIBUJA LA GRÁFICA:
  cargarEstadisticasPuestos(): void {
    this.puestosSedesEstablecimientosClientesService.findCountTotalRegisters().subscribe({
      next: (total) => {
        this.totalPuestos = total;
        this.puestosSedesEstablecimientosClientesService.findCountTotalRegisters(undefined, 'INACTIVO').subscribe({
          next: (inactivos) => {
            this.totalPuestosInactivos = inactivos;
            this.totalPuestosActivos = total - inactivos;
            this.dibujarGrafica(this.graficaPuestosRef, 'Puestos de Sedes de Establecimientos Clientes', this.totalPuestosActivos, this.totalPuestosInactivos, '#8b5cf6');
          },
          error: (err) => console.error('ERROR AL CONTAR PUESTOS INACTIVOS: ', err)
        });
      },
      error: (err) => console.error('ERROR AL CONTAR TOTAL PUESTOS: ', err)
    });
  }

  //MÉTODO GENÉRICO PARA DIBUJAR UNA GRÁFICA DE BARRAS DE ACTIVOS VS INACTIVOS:
  private dibujarGrafica(canvasRef: ElementRef<HTMLCanvasElement>, titulo: string, activos: number, inactivos: number, color: string): void {
    if (!canvasRef?.nativeElement) return;

    const grafica = new Chart(canvasRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Activos', 'Inactivos', 'Total'],
        datasets: [{
          label: titulo,
          data: [activos, inactivos, activos + inactivos],
          backgroundColor: [color, '#ef4444', '#94a3b8'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: true, text: titulo, font: { size: 13, weight: 'bold' } }
        },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } }
        }
      }
    });

    this.graficas.push(grafica);
  }
}
