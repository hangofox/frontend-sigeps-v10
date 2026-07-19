//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

//IMPORTACIÓN DE LIBRERÍAS DE GENERACIÓN DE PDF Y EXCEL:
//pdfMake EXPORTA UNA INSTANCIA SINGLETON (NO FUNCIONES SUELTAS): SUS MÉTODOS USAN "this" INTERNAMENTE,
//POR ESO SE IMPORTA COMO OBJETO POR DEFECTO Y SE INVOCAN COMO "pdfMake.metodo(...)" EN VEZ DE DESESTRUCTURARLOS:
import pdfMake from 'pdfmake/build/pdfmake';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

//LLAMAMOS EL ARCHIVO CON LAS FUENTES DE LETRAS ESTABLECIDAS EN FORMATO DE CODIFICACIÓN BASE64:
const fontsVfs = require('src/assets/fonts/fonts-vfs.js');

//IMPORTACIÓN DE INTERFACES:
import { EmpleadosI } from '../../../interfaces/gestion-personal/empleados/empleados.interface';
import { HistorialNovedadesEmpleadosI } from '../../../interfaces/gestion-personal/historial-novedades-empleados/historialNovedadesEmpleados.interface';
import { AltasEmpleadosI } from '../../../interfaces/gestion-personal/empleados/altas-empleados/altasEmpleados.interface';
import { BajasEmpleadosI } from '../../../interfaces/gestion-personal/empleados/bajas-empleados/bajasEmpleados.interface';
import { HistorialMovimientosEmpleadosI } from '../../../interfaces/gestion-personal/historial-movimientos-empleados/historialMovimientosEmpleados.interface';

//IMPORTACIÓN DE SERVICIOS:
import { EmpleadosService } from '../../../services/gestion-personal/empleados/empleados.service';
import { NovedadesEmpleadosService } from '../../../services/gestion-personal/historial-novedades-empleados/historialNovedadesEmpleados.service';
import { AltasEmpleadosService } from '../../../services/gestion-personal/empleados/altas-empleados/altasEmpleados.service';
import { BajasEmpleadosService } from '../../../services/gestion-personal/empleados/bajas-empleados/bajasEmpleados.service';
import { HistorialMovimientosEmpleadosService } from '../../../services/gestion-personal/historial-movimientos-empleados/historialMovimientosEmpleados.service';
import { ParametrosSistemaService } from '../../../services/panel-control/parametros-sistema/parametros-sistema.service';
import { GestionArchivosService } from '../../../services/gestion-archivos/gestion-archivos.service';

//CONFIGURACIÓN DE FUENTES DE PDFMAKE (SE EJECUTA UNA SOLA VEZ AL CARGAR EL MÓDULO):
//ASIGNAMOS LOS VALORES DE LOS CONTENIDOS DE LA FUENTE DE LETRA EN FORMATO BASE64 DEL ARCHIVO IMPORTADO:
(pdfMake as any).addVirtualFileSystem({
  'arial-normal.ttf': fontsVfs['arial-normal.ttf'],
  'arial-bold.ttf': fontsVfs['arial-bold.ttf'],
  'arial-italic.ttf': fontsVfs['arial-italic.ttf'],
  'arial-bold-italic.ttf': fontsVfs['arial-bold-italic.ttf']
});

//ASIGNAMOS LOS VALORES DE LOS CONTENIDOS DE LA FUENTE DE LETRA EN FORMATO BASE64 Y CREAMOS TODA LA FAMILIA DE LA FUENTE:
(pdfMake as any).addFonts({
  Arial: {
    normal: 'arial-normal.ttf',
    bold: 'arial-bold.ttf',
    italics: 'arial-italic.ttf',
    bolditalics: 'arial-bold-italic.ttf'
  }
});

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements OnInit {

  //DECLARACIÓN DE VARIABLES GLOBALES:
  reportesForm!: FormGroup;
  consultando: boolean = false;
  consultaRealizada: boolean = false;

  //DATOS CONSULTADOS DEL EMPLEADO:
  empleadoConsultado: EmpleadosI | null = null;
  novedadesEmpleado: HistorialNovedadesEmpleadosI[] = [];
  altasEmpleado: AltasEmpleadosI[] = [];
  bajasEmpleado: BajasEmpleadosI[] = [];

  //HISTORIAL DE MOVIMIENTOS: LISTA COMPLETA DEL EMPLEADO Y LISTA YA FILTRADA POR RANGO DE FECHAS (LA QUE SE MUESTRA Y DESCARGA):
  movimientosEmpleadoCompleto: HistorialMovimientosEmpleadosI[] = [];
  movimientosEmpleado: HistorialMovimientosEmpleadosI[] = [];

  //FOTO DEL EMPLEADO CONSULTADO: URL DE OBJETO PARA LA VISTA PREVIA EN PANTALLA Y BASE64 (DATA URI) PARA
  //EMBEBERLA DENTRO DEL PDF DE LA HOJA DE VIDA (pdfMake EXIGE base64, NO ACEPTA blob: NI URLs REMOTAS):
  previewUrlFotoEmpleadoConsultado: string | null = null;
  private fotoEmpleadoBase64PDF: string | null = null;

  //TOAST GLOBAL:
  toastMensaje: string = '';
  toastTipo: string = '';
  private toastTimer: any = null;

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private formBuilder: FormBuilder,
    private empleadosService: EmpleadosService,
    private novedadesEmpleadosService: NovedadesEmpleadosService,
    private altasEmpleadosService: AltasEmpleadosService,
    private bajasEmpleadosService: BajasEmpleadosService,
    private historialMovimientosEmpleadosService: HistorialMovimientosEmpleadosService,
    private parametrosSistemaService: ParametrosSistemaService,
    private gestionArchivosService: GestionArchivosService
  ) {}

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    this.initForm();
  }

  //MÉTODO DE INICIALIZACIÓN DEL FORMULARIO:
  initForm(): void {
    this.reportesForm = this.formBuilder.group({
      cboxTipoReporteSeleccionado: new FormControl('hojaVida'),
      ctextNumeroDocumentoIdentificacion: new FormControl(''),
      ctextFechaInicioMovimientos: new FormControl(''),
      ctextFechaFinMovimientos: new FormControl('')
    });
  }

  //MÉTODO QUE CAMBIA EL TIPO DE REPORTE Y LIMPIA LA CONSULTA ANTERIOR:
  cambiarTipoReporte(): void {
    this.limpiarConsulta();
  }

  //MÉTODO QUE LIMPIA LOS RESULTADOS DE LA CONSULTA ACTUAL:
  limpiarConsulta(): void {
    this.consultaRealizada = false;
    this.empleadoConsultado = null;
    this.novedadesEmpleado = [];
    this.altasEmpleado = [];
    this.bajasEmpleado = [];
    this.movimientosEmpleadoCompleto = [];
    this.movimientosEmpleado = [];
    if (this.previewUrlFotoEmpleadoConsultado) URL.revokeObjectURL(this.previewUrlFotoEmpleadoConsultado);
    this.previewUrlFotoEmpleadoConsultado = null;
    this.fotoEmpleadoBase64PDF = null;
  }

  //RESUELVE LA FOTO DEL EMPLEADO CONSULTADO: UNA URL DE OBJETO PARA MOSTRARLA EN EL AVATAR DE LA FICHA, Y EN
  //PARALELO SU VERSIÓN BASE64 (DATA URI) PARA PODER EMBEBERLA DENTRO DEL PDF DE LA HOJA DE VIDA:
  private resolverFotoEmpleadoConsultado(nombreArchivo: string): void {
    this.parametrosSistemaService.getSystemParameterbyId(1).subscribe({
      next: (respuestaParametros) => {
        const parametrosSistema = respuestaParametros.parametrosSistemaDTO;
        const rutaCompleta = String(parametrosSistema.rutaDestinoCarpetaPrincipalServidorAplicaciones)
          + String(parametrosSistema.rutaDestinoArchivosEmpleados) + nombreArchivo;
        this.gestionArchivosService.getFile(rutaCompleta).subscribe({
          next: (respuestaArchivo) => {
            this.gestionArchivosService.getFileBytes(respuestaArchivo.rutaEstatica).subscribe({
              next: (blob) => {
                this.previewUrlFotoEmpleadoConsultado = URL.createObjectURL(blob);
                const lector = new FileReader();
                lector.onload = () => { this.fotoEmpleadoBase64PDF = lector.result as string; };
                lector.readAsDataURL(blob);
              },
              error: () => { this.previewUrlFotoEmpleadoConsultado = null; this.fotoEmpleadoBase64PDF = null; }
            });
          },
          error: () => { this.previewUrlFotoEmpleadoConsultado = null; this.fotoEmpleadoBase64PDF = null; }
        });
      },
      error: (err) => console.error('ERROR AL OBTENER LOS PARÁMETROS DEL SISTEMA PARA LA FOTO DEL EMPLEADO: ', err)
    });
  }

  //MÉTODO PRINCIPAL DE CONSULTA — TRAE EL EMPLEADO Y SU INFORMACIÓN RELACIONADA SEGÚN EL TIPO DE REPORTE SELECCIONADO:
  consultarEmpleado(): void {
    const numeroDocumento = (this.reportesForm.value.ctextNumeroDocumentoIdentificacion || '').trim();
    if (!numeroDocumento) {
      this.mostrarToast('error', 'Digite el número de documento de identificación.');
      return;
    }

    this.limpiarConsulta();
    this.consultando = true;

    this.empleadosService.getEmployeebyNumeroDocumentoIdentificacion(numeroDocumento).subscribe({
      next: (respuesta) => {
        if (!respuesta.empleadoDTO || !respuesta.empleadoDTO.idEmpleado) {
          this.consultando = false;
          this.mostrarToast('error', 'No se encontró ningún empleado con ese número de documento.');
          return;
        }
        this.empleadoConsultado = respuesta.empleadoDTO;
        if (respuesta.empleadoDTO.nombreArchivoFotoExtensionOFormatoEmpleado) {
          this.resolverFotoEmpleadoConsultado(String(respuesta.empleadoDTO.nombreArchivoFotoExtensionOFormatoEmpleado));
        }
        this.cargarInformacionRelacionada(Number(respuesta.empleadoDTO.idEmpleado));
      },
      error: (err) => {
        console.error('ERROR AL CONSULTAR EMPLEADO: ', err);
        this.consultando = false;
        this.mostrarToast('error', 'No se encontró ningún empleado con ese número de documento.');
      }
    });
  }

  //CARGA LA INFORMACIÓN RELACIONADA DEL EMPLEADO SEGÚN EL TIPO DE REPORTE SELECCIONADO (FILTRADA EXACTA POR
  //idEmpleado EN EL CLIENTE, YA QUE EL BACKEND SOLO OFRECE "keyword" DE COINCIDENCIA PARCIAL SOBRE ESTAS LISTAS):
  cargarInformacionRelacionada(idEmpleado: number): void {
    const tipoReporte = this.reportesForm.value.cboxTipoReporteSeleccionado;

    //HOJA DE VIDA: DATOS PERSONALES + NOVEDADES + ALTAS + BAJAS:
    if (tipoReporte === 'hojaVida') {
      this.novedadesEmpleadosService.findAllEmployeeIncidentHistories(undefined, undefined, 'idHistorialNovedadEmpleado', 'ASC').subscribe({
        next: (data) => {
          this.novedadesEmpleado = data.filter(n => n.empleadoDTO?.idEmpleado === idEmpleado);
        },
        error: (err) => console.error('ERROR AL CARGAR NOVEDADES: ', err)
      });

      this.altasEmpleadosService.findAllHiringsOfEmployees(undefined, undefined, 'idAltaEmpleado', 'ASC').subscribe({
        next: (data) => {
          this.altasEmpleado = data.filter(a => a.empleadoDTO?.idEmpleado === idEmpleado);
          this.finalizarConsulta();
        },
        error: (err) => {
          console.error('ERROR AL CARGAR ALTAS: ', err);
          this.finalizarConsulta();
        }
      });

      this.bajasEmpleadosService.findAllDischargesOfEmployees(undefined, undefined, 'idBajaEmpleado', 'ASC').subscribe({
        next: (data) => {
          this.bajasEmpleado = data.filter(b => b.empleadoDTO?.idEmpleado === idEmpleado);
        },
        error: (err) => console.error('ERROR AL CARGAR BAJAS: ', err)
      });
    }

    //ENTRADAS Y SALIDAS: HISTORIAL DE MOVIMIENTOS DEL EMPLEADO (TIPO DE MOVIMIENTO = ENTRADA/SALIDA):
    if (tipoReporte === 'entradasSalidas') {
      this.historialMovimientosEmpleadosService.findAllEmployeeMovementHistories(undefined, undefined, 'idHistorialMovimientoEmpleado', 'ASC').subscribe({
        next: (data) => {
          this.movimientosEmpleadoCompleto = data.filter(m => m.empleadoDTO?.idEmpleado === idEmpleado);
          this.aplicarFiltroFechasMovimientos();
          this.finalizarConsulta();
        },
        error: (err) => {
          console.error('ERROR AL CARGAR HISTORIAL DE MOVIMIENTOS: ', err);
          this.finalizarConsulta();
        }
      });
    }
  }

  //FILTRA this.movimientosEmpleadoCompleto POR EL RANGO DE FECHAS DIGITADO (SI NO HAY FECHAS, MUESTRA TODO EL HISTORIAL):
  aplicarFiltroFechasMovimientos(): void {
    const fechaInicio: string = this.reportesForm.value.ctextFechaInicioMovimientos || '';
    const fechaFin: string = this.reportesForm.value.ctextFechaFinMovimientos || '';

    this.movimientosEmpleado = this.movimientosEmpleadoCompleto.filter(m => {
      const fechaMovimiento = String(m.fechaHMSHistorialMovimientoEmpleado || '').slice(0, 10);
      if (fechaInicio && fechaMovimiento < fechaInicio) return false;
      if (fechaFin && fechaMovimiento > fechaFin) return false;
      return true;
    });
  }

  //MÉTODO QUE MARCA LA CONSULTA COMO FINALIZADA (SE INVOCA CUANDO YA LLEGÓ LA RESPUESTA DE ALTAS, LA MÁS LENTA HABITUALMENTE):
  finalizarConsulta(): void {
    this.consultando = false;
    this.consultaRealizada = true;
  }

  //RETORNA EL NOMBRE COMPLETO DEL EMPLEADO CONSULTADO:
  get nombreCompletoEmpleado(): string {
    if (!this.empleadoConsultado) return '';
    const e = this.empleadoConsultado;
    return `${e.nombresEmpleado} ${e.primerApellidoEmpleado} ${e.segundoApellidoEmpleado || ''}`.trim();
  }

  //MÉTODO PARA DESCARGAR LA HOJA DE VIDA DEL EMPLEADO EN PDF:
  descargarHojaVidaPdf(): void {
    if (!this.empleadoConsultado) return;
    const e = this.empleadoConsultado;

    const contenido: any[] = [
      { text: 'HOJA DE VIDA DEL EMPLEADO', style: 'tituloPrincipal' },
      { text: 'SIGEPS — Sistema de Gestión de Vigilancia de Personal de Seguridad', style: 'subtitulo' },
      { text: ' ', margin: [0, 6] },

      //FOTO DEL EMPLEADO (SI TIENE UNA CARGADA) — SE INSERTA COMO IMAGEN BASE64, YA QUE pdfMake NO ACEPTA blob: NI URLs REMOTAS:
      ...(this.fotoEmpleadoBase64PDF
        ? [{ image: this.fotoEmpleadoBase64PDF, width: 90, alignment: 'center', margin: [0, 0, 0, 10] }]
        : []),

      { text: 'DATOS PERSONALES', style: 'tituloSeccion' },
      {
        table: {
          widths: ['35%', '65%'],
          body: [
            ['Nombres y Apellidos', this.nombreCompletoEmpleado],
            ['Tipo de Documento', String(e.tipoDocumentoIdentificacionDTO?.nombreTipoDocumentoIdentificacion || '')],
            ['Número de Documento', String(e.numeroDocumentoIdentificacionEmpleado || '')],
            ['Tipo de Empleado', String(e.tipoEmpleadoDTO?.nombreTipoEmpleado || '')],
            ['Tipo de Empleado Planta', String(e.tipoEmpleadoPlantaDTO?.nombreTipoEmpleadoPlanta || '')],
            ['Clasificación', String(e.clasificacionEmpleadoPlantaDTO?.nombreClasificacionEmpleadoPlanta || '')],
            ['Subclasificación', String(e.subclasificacionEmpleadoPlantaDTO?.nombreSubclasificacionEmpleadoPlanta || '')],
            ['Dirección', String(e.direccionEmpleado || 'No registrada')],
            ['Teléfono', String(e.telefonoEmpleado || 'No registrado')],
            ['Móvil', String(e.movilEmpleado || '')],
            ['Correo Personal', String(e.correoElectronicoPersonalEmpleado || 'No registrado')],
            ['Correo Institucional', String(e.correoElectronicoInstitucionalEmpleado || 'No registrado')],
            ['País de Origen', String(e.paisOrigenEmpleado || '')],
            ['Departamento / Estado de Origen', String(e.departamentooEstadoOrigenEmpleado || '')],
            ['Ciudad de Origen', String(e.ciudadOrigenEmpleado || '')],
            ['Estado', String(e.estadoEmpleado || '')],
            ['Fecha de Ingreso', String(e.fechaHMSIngresoEmpleado || '')]
          ]
        },
        layout: 'lightHorizontalLines'
      },
      { text: ' ', margin: [0, 8] },

      { text: 'HISTORIAL DE NOVEDADES', style: 'tituloSeccion' },
      this.novedadesEmpleado.length === 0
        ? { text: 'No se registran novedades para este empleado.', style: 'sinDatos' }
        : {
            table: {
              widths: ['20%', '25%', '55%'],
              body: [
                [{ text: 'Fecha', style: 'encabezadoTabla' }, { text: 'Tipo de Novedad', style: 'encabezadoTabla' }, { text: 'Descripción', style: 'encabezadoTabla' }],
                ...this.novedadesEmpleado.map(n => [
                  String(n.fechaHMSHistorialNovedadEmpleado || ''),
                  String(n.tipoNovedadEmpleadoDTO?.nombreTipoNovedadEmpleado || ''),
                  String(n.descripcionHistorialNovedadEmpleado || '')
                ])
              ]
            },
            layout: 'lightHorizontalLines'
          },
      { text: ' ', margin: [0, 8] },

      { text: 'ALTAS (INGRESOS)', style: 'tituloSeccion' },
      this.altasEmpleado.length === 0
        ? { text: 'No se registran altas para este empleado.', style: 'sinDatos' }
        : {
            table: {
              widths: ['30%', '70%'],
              body: [
                [{ text: 'Fecha', style: 'encabezadoTabla' }, { text: 'N° Contrato / Acto Administrativo', style: 'encabezadoTabla' }],
                ...this.altasEmpleado.map(a => [
                  String(a.fechaHMSAltaEmpleado || ''),
                  String(a.numeroContratoOActoAdmvoNombEmpleado || '')
                ])
              ]
            },
            layout: 'lightHorizontalLines'
          },
      { text: ' ', margin: [0, 8] },

      { text: 'BAJAS (RETIROS)', style: 'tituloSeccion' },
      this.bajasEmpleado.length === 0
        ? { text: 'No se registran bajas para este empleado.', style: 'sinDatos' }
        : {
            table: {
              widths: ['30%', '70%'],
              body: [
                [{ text: 'Fecha', style: 'encabezadoTabla' }, { text: 'N° Contrato / Acto Administrativo', style: 'encabezadoTabla' }],
                ...this.bajasEmpleado.map(b => [
                  String(b.fechaHMSBajaEmpleado || ''),
                  String(b.numeroContratoOActoAdmvoNombEmpleado || '')
                ])
              ]
            },
            layout: 'lightHorizontalLines'
          }
    ];

    const docDefinition: any = {
      pageSize: 'LETTER',
      pageMargins: [40, 40, 40, 50],
      content: contenido,
      footer: (currentPage: number, pageCount: number) => ({
        text: `Generado por SIGEPS el ${new Date().toLocaleString('es-CO')} — Página ${currentPage} de ${pageCount}`,
        style: 'pie',
        margin: [40, 0, 40, 0]
      }),
      styles: {
        tituloPrincipal: { fontSize: 16, bold: true, alignment: 'center' },
        subtitulo: { fontSize: 10, alignment: 'center', color: '#555555', margin: [0, 2, 0, 0] },
        tituloSeccion: { fontSize: 12, bold: true, color: '#0284c7', margin: [0, 4, 0, 4] },
        encabezadoTabla: { bold: true, fillColor: '#f1f5f9' },
        sinDatos: { fontSize: 10, italics: true, color: '#888888' },
        pie: { fontSize: 8, color: '#888888', alignment: 'center' }
      },
      defaultStyle: { font: 'Arial', fontSize: 10 }
    };

    const numeroDocumento = this.empleadoConsultado.numeroDocumentoIdentificacionEmpleado;
    (pdfMake as any).createPdf(docDefinition).download(`HojaDeVida_${numeroDocumento}.pdf`);
  }

  //MÉTODO PARA DESCARGAR EL REPORTE DE ENTRADAS Y SALIDAS (HISTORIAL DE MOVIMIENTOS) DEL EMPLEADO EN EXCEL:
  descargarEntradasySalidasExcel(): void {
    if (!this.empleadoConsultado) return;

    const filas = this.movimientosEmpleado
      .slice()
      .sort((a, b) => String(a.fechaHMSHistorialMovimientoEmpleado).localeCompare(String(b.fechaHMSHistorialMovimientoEmpleado)))
      .map(m => ({
        'Tipo de Movimiento': String(m.tipoMovimientoDTO.nombreTipoMovimiento || ''),
        'Fecha': String(m.fechaHMSHistorialMovimientoEmpleado || ''),
        'Puesto': String(m.programacionTurnoEmpleadoDTO?.puestoSedeEstablecimientoClienteDTO?.nombrePuestoSedeEstablecimientoCliente || ''),
        'Turno': String(m.programacionTurnoEmpleadoDTO?.turnoDTO?.nombreTurno || '')
      }));

    const encabezadoEmpleado = [
      { 'Tipo de Movimiento': 'EMPLEADO:', 'Fecha': this.nombreCompletoEmpleado, 'Puesto': '', 'Turno': '' },
      { 'Tipo de Movimiento': 'DOCUMENTO:', 'Fecha': String(this.empleadoConsultado.numeroDocumentoIdentificacionEmpleado || ''), 'Puesto': '', 'Turno': '' },
      { 'Tipo de Movimiento': '', 'Fecha': '', 'Puesto': '', 'Turno': '' }
    ];

    const hoja = XLSX.utils.json_to_sheet([...encabezadoEmpleado, ...filas], { skipHeader: false });
    hoja['!cols'] = [{ wch: 18 }, { wch: 22 }, { wch: 30 }, { wch: 20 }];

    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Entradas y Salidas');

    const buffer = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, `EntradasYSalidas_${this.empleadoConsultado.numeroDocumentoIdentificacionEmpleado}.xlsx`);
  }

  //MÉTODO QUE MUESTRA UN TOAST TEMPORAL:
  mostrarToast(tipo: string, mensaje: string): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTipo = tipo;
    this.toastMensaje = mensaje;
    this.toastTimer = setTimeout(() => { this.toastMensaje = ''; }, 4000);
  }
}
