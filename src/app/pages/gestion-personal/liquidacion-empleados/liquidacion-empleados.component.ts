//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-liquidacion-empleados',
  templateUrl: './liquidacion-empleados.component.html',
  styleUrls: ['./liquidacion-empleados.component.scss']
})
export class LiquidacionEmpleadosComponent implements OnInit {

  //DECLARACIÓN DE VARIABLES GLOBALES:
  liquidacionesForm!: FormGroup;

  //SEMÁFORO DE TOTALES:
  totalRegistros: number = 0;
  totalValorBruto: number = 0;
  totalValorNeto: number = 0;

  //PAGINACIÓN:
  paginaActual: number = 0;
  tandaNumeroRegistrosporPagina: number = 10;

  //TIPOS DE LIQUIDACIÓN — SIMULADOS:
  tiposLiquidacion: any[] = [
    { nombre: 'TODOS LOS TIPOS' },
    { nombre: 'LIQUIDACIÓN DEFINITIVA' },
    { nombre: 'LIQUIDACIÓN PARCIAL' },
    { nombre: 'PRIMA DE SERVICIOS' },
    { nombre: 'CESANTÍAS' },
    { nombre: 'VACACIONES' },
  ];

  //DATOS SIMULADOS DE LIQUIDACIONES:
  private liquidacionesSimuladas: any[] = [
    { idLiquidacion: 1, nombreEmpleado: 'CARLOS ANDRÉS RODRÍGUEZ', documentoEmpleado: '80500001', tipoLiquidacion: 'PRIMA DE SERVICIOS', fechaLiquidacion: '2026-06-15', valorBruto: 1200000, valorDescuentos: 96000, valorNeto: 1104000, estadoLiquidacion: 'PROCESADA' },
    { idLiquidacion: 2, nombreEmpleado: 'ANA MARÍA VELÁZQUEZ', documentoEmpleado: '52600002', tipoLiquidacion: 'CESANTÍAS', fechaLiquidacion: '2026-06-15', valorBruto: 980000, valorDescuentos: 78400, valorNeto: 901600, estadoLiquidacion: 'PROCESADA' },
    { idLiquidacion: 3, nombreEmpleado: 'PEDRO PABLO SALCEDO', documentoEmpleado: '94900005', tipoLiquidacion: 'VACACIONES', fechaLiquidacion: '2026-06-20', valorBruto: 850000, valorDescuentos: 68000, valorNeto: 782000, estadoLiquidacion: 'PENDIENTE' },
    { idLiquidacion: 4, nombreEmpleado: 'MARÍA JOSÉ HERRERA', documentoEmpleado: '39800004', tipoLiquidacion: 'PRIMA DE SERVICIOS', fechaLiquidacion: '2026-06-20', valorBruto: 750000, valorDescuentos: 60000, valorNeto: 690000, estadoLiquidacion: 'PENDIENTE' },
  ];

  //LISTA FILTRADA:
  liquidaciones: any[] = [];

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.accionListar();
  }

  initForm(): void {
    this.liquidacionesForm = this.formBuilder.group({
      ctextPalabraClave: new FormControl(''),
      cboxTipoLiquidacionSeleccionado: new FormControl('TODOS LOS TIPOS'),
      cboxTandaNumeroRegistrosporPaginaSeleccionado: new FormControl('10')
    });
  }

  accionListar(): void {
    const formValues = this.liquidacionesForm.value;
    const palabraClave = formValues.ctextPalabraClave.trim().toUpperCase();
    const tipo = formValues.cboxTipoLiquidacionSeleccionado;

    let filtrado = [...this.liquidacionesSimuladas];

    if (tipo !== 'TODOS LOS TIPOS') {
      filtrado = filtrado.filter(l => l.tipoLiquidacion === tipo);
    }
    if (palabraClave) {
      filtrado = filtrado.filter(l =>
        l.nombreEmpleado.includes(palabraClave) ||
        l.documentoEmpleado.includes(palabraClave)
      );
    }

    this.totalRegistros = filtrado.length;
    this.totalValorBruto = filtrado.reduce((acc, l) => acc + l.valorBruto, 0);
    this.totalValorNeto = filtrado.reduce((acc, l) => acc + l.valorNeto, 0);

    const inicio = this.paginaActual * this.tandaNumeroRegistrosporPagina;
    this.liquidaciones = filtrado.slice(inicio, inicio + this.tandaNumeroRegistrosporPagina);
  }

  calcularTotalPaginas(): number {
    const total = Math.ceil(this.totalRegistros / this.tandaNumeroRegistrosporPagina);
    return total > 0 ? total : 1;
  }

  cambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
    this.accionListar();
  }

  seleccionarTandaNumeroRegistrosporPagina(): void {
    this.tandaNumeroRegistrosporPagina = Number(this.liquidacionesForm.value.cboxTandaNumeroRegistrosporPaginaSeleccionado);
    this.paginaActual = 0;
    this.accionListar();
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor);
  }
}
