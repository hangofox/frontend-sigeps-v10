//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

//IMPORTACIÓN DE INTERFACES:
import { HistorialNovedadesEmpleadosI } from '../../../../interfaces/gestion-personal/historial-novedades-empleados/historialNovedadesEmpleados.interface';
import { ResponseHistorialNovedadEmpleadoDTO } from '../../../../interfaces/gestion-personal/historial-novedades-empleados/responseHistorialNovedadEmpleadoDTO.interface';
import { TipoNovedadEmpleadoI } from '../../../../interfaces/gestion-personal/tipos-novedades-empleados/tipos-novedades-empleados.interface';
import { EmpleadosI } from '../../../../interfaces/gestion-personal/empleados/empleados.interface';

//IMPORTACIÓN DE SERVICIOS:
import { NovedadesEmpleadosService } from '../../../../services/gestion-personal/historial-novedades-empleados/historialNovedadesEmpleados.service';
import { TiposNovedadesEmpleadosService } from '../../../../services/gestion-personal/tipos-novedades-empleados/tiposNovedadesEmpleados.service';
import { EmpleadosService } from '../../../../services/gestion-personal/empleados/empleados.service';
import { AuditoriasSistemaService } from '../../../../services/panel-control/auditorias-sistema/auditorias-sistema.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-add-upd-del-historial-novedad-empleado',
  templateUrl: './add-upd-del-historial-novedad-empleado.component.html',
  styleUrls: ['./add-upd-del-historial-novedad-empleado.component.scss']
})
export class AddUpdDelHistorialNovedadEmpleadoComponent implements OnInit, OnChanges {

  @Input() modo: string = 'guardar';
  @Input() novedadData: HistorialNovedadesEmpleadosI | null = null;
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() toastEvento = new EventEmitter<{ tipo: string; mensaje: string }>();

  novedadForm!: FormGroup;
  banderaCrudGuardar: boolean = false;
  banderaCrudModificar: boolean = false;
  banderaCrudEliminar: boolean = false;
  banderaConfirmacionEliminacion: boolean = false;
  mensajeBusquedaEmpleado: string = '';
  private componenteInicializado: boolean = false;
  private empleadoCargado: EmpleadosI | null = null;
  tiposNovedadesEmpleados: TipoNovedadEmpleadoI[] = [];

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    private novedadesEmpleadosService: NovedadesEmpleadosService,
    private tiposNovedadesEmpleadosService: TiposNovedadesEmpleadosService,
    private empleadosService: EmpleadosService,
    private auditoriasSistemaService: AuditoriasSistemaService
  ) {}

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    this.configurarBanderas();
    this.initForm();
    this.cargarCombos();
    if (this.modo !== 'guardar' && this.novedadData) {
      this.chargueForm();
    }
    this.componenteInicializado = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.componenteInicializado) return;
    if (changes['novedadData'] || changes['modo']) {
      this.configurarBanderas();
      this.initForm();
      if (this.modo !== 'guardar' && this.novedadData) {
        this.chargueForm();
      }
    }
  }

  //CONFIGURA LAS BANDERAS DEL MODO DEL CRUD:
  configurarBanderas(): void {
    this.banderaCrudGuardar = this.modo === 'guardar';
    this.banderaCrudModificar = this.modo === 'modificar';
    this.banderaCrudEliminar = this.modo === 'eliminar';
  }

  //MÉTODO DE INICIALIZACIÓN DEL FORMULARIO:
  initForm(): void {
    this.novedadForm = this.formBuilder.group({
      ctextIdHistorialNovedadEmpleado: new FormControl(''),
      ctextNumeroDocumentoIdentificacionEmpleado: new FormControl('', Validators.required),
      ctextNombreCompletoEmpleado: new FormControl({ value: '', disabled: true }),
      cboxIdTipoNovedadEmpleado: new FormControl('', Validators.required),
      ctextFechaHMSHistorialNovedadEmpleado: new FormControl('', Validators.required),
      ctextDescripcionHistorialNovedadEmpleado: new FormControl('', Validators.required)
    });
    this.mensajeBusquedaEmpleado = '';
    this.empleadoCargado = null;
  }

  //CARGA LOS COMBOS DESDE EL BACKEND:
  cargarCombos(): void {
    this.tiposNovedadesEmpleadosService.findAllTypesOfEmployeeIncidents(undefined, undefined, 'nombreTipoNovedadEmpleado', 'ASC')
      .subscribe({
        next: (data) => this.tiposNovedadesEmpleados = data,
        error: (err) => console.error('ERROR AL CARGAR TIPOS DE NOVEDADES: ', err)
      });
  }

  //PUEBLA EL FORMULARIO CON LOS DATOS DE LA NOVEDAD A MODIFICAR/ELIMINAR:
  chargueForm(): void {
    const n = this.novedadData!;
    this.empleadoCargado = n.empleadoDTO;
    this.novedadForm = this.formBuilder.group({
      ctextIdHistorialNovedadEmpleado: new FormControl(n.idHistorialNovedadEmpleado || ''),
      ctextNumeroDocumentoIdentificacionEmpleado: new FormControl(n.empleadoDTO?.numeroDocumentoIdentificacionEmpleado || '', Validators.required),
      ctextNombreCompletoEmpleado: new FormControl({ value: `${n.empleadoDTO?.nombresEmpleado || ''} ${n.empleadoDTO?.primerApellidoEmpleado || ''} ${n.empleadoDTO?.segundoApellidoEmpleado || ''}`.trim(), disabled: true }),
      cboxIdTipoNovedadEmpleado: new FormControl(n.tipoNovedadEmpleadoDTO?.idTipoNovedadEmpleado || '', Validators.required),
      ctextFechaHMSHistorialNovedadEmpleado: new FormControl(this.formatearFechaParaInput(n.fechaHMSHistorialNovedadEmpleado), Validators.required),
      ctextDescripcionHistorialNovedadEmpleado: new FormControl(n.descripcionHistorialNovedadEmpleado || '', Validators.required)
    });
    this.changeDetectorRef.detectChanges();
  }

  //NORMALIZA UNA FECHA DEL BACKEND AL FORMATO YYYY-MM-DDTHH:mm:
  formatearFechaParaInput(fecha: any): string {
    if (!fecha) return '';
    const s = String(fecha).replace(' ', 'T');
    return s.length > 16 ? s.slice(0, 16) : s;
  }

  //BUSCA EL EMPLEADO POR NÚMERO DE DOCUMENTO:
  buscarEmpleadoPorDocumento(): void {
    const doc = (this.novedadForm.get('ctextNumeroDocumentoIdentificacionEmpleado')?.value || '').trim();
    if (!doc) {
      this.mensajeBusquedaEmpleado = 'Ingrese un número de documento.';
      return;
    }
    this.mensajeBusquedaEmpleado = 'Buscando...';
    this.empleadosService.getEmployeebyNumeroDocumentoIdentificacion(doc).subscribe({
      next: (resp) => {
        if (resp.empleadoDTO) {
          this.empleadoCargado = resp.empleadoDTO;
          const nombreCompleto = `${resp.empleadoDTO.nombresEmpleado || ''} ${resp.empleadoDTO.primerApellidoEmpleado || ''} ${resp.empleadoDTO.segundoApellidoEmpleado || ''}`.trim();
          this.novedadForm.patchValue({ ctextNombreCompletoEmpleado: nombreCompleto });
          this.mensajeBusquedaEmpleado = '';
        } else {
          this.empleadoCargado = null;
          this.novedadForm.patchValue({ ctextNombreCompletoEmpleado: '' });
          this.mensajeBusquedaEmpleado = 'No se encontró el empleado.';
        }
      },
      error: () => {
        this.empleadoCargado = null;
        this.novedadForm.patchValue({ ctextNombreCompletoEmpleado: '' });
        this.mensajeBusquedaEmpleado = 'No se encontró el empleado.';
      }
    });
  }

  //CONSTRUYE EL DTO DE NOVEDAD DESDE LOS VALORES DEL FORMULARIO:
  construirNovedadDesdeFormulario(fv: any, esModificacion: boolean): HistorialNovedadesEmpleadosI {
    return {
      ...(esModificacion ? { idHistorialNovedadEmpleado: Number(fv.ctextIdHistorialNovedadEmpleado) } : {}),
      fechaHMSHistorialNovedadEmpleado: fv.ctextFechaHMSHistorialNovedadEmpleado,
      descripcionHistorialNovedadEmpleado: fv.ctextDescripcionHistorialNovedadEmpleado,
      empleadoDTO: this.empleadoCargado!,
      tipoNovedadEmpleadoDTO: {
        idTipoNovedadEmpleado: Number(fv.cboxIdTipoNovedadEmpleado),
        nombreTipoNovedadEmpleado: ''
      }
    };
  }

  //ACCIÓN GUARDAR:
  accionGuardarNovedad(): void {
    if (this.novedadForm.invalid || !this.empleadoCargado) {
      this.mensajeBusquedaEmpleado = !this.empleadoCargado ? 'Busque y seleccione un empleado válido.' : '';
      return;
    }
    const fv = this.novedadForm.getRawValue();
    const novedad = this.construirNovedadDesdeFormulario(fv, false);
    const nombreTipoNovedad = this.tiposNovedadesEmpleados.find(t => t.idTipoNovedadEmpleado === Number(fv.cboxIdTipoNovedadEmpleado))?.nombreTipoNovedadEmpleado;
    this.novedadesEmpleadosService.addEmployeeIncidentHistory(novedad).subscribe({
      next: (resp: ResponseHistorialNovedadEmpleadoDTO) => {
        //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL CREAR UNA NOVEDAD DE PERSONAL (VER AuditoriasSistemaService.registrarAuditoria):
        this.auditoriasSistemaService.registerSystemAudit(
          'CREAR NOVEDAD DE PERSONAL',
          `Se registró una novedad de tipo "${nombreTipoNovedad}" para el empleado ${this.empleadoCargado?.nombresEmpleado} ${this.empleadoCargado?.primerApellidoEmpleado}.`
        );
        this.toastEvento.emit({ tipo: 'exito', mensaje: resp.mensaje || 'Novedad registrada con éxito.' });
        this.cerrarModal.emit();
      },
      error: (err) => {
        console.error('ERROR AL GUARDAR NOVEDAD: ', err);
        this.toastEvento.emit({ tipo: 'error', mensaje: 'Error al registrar la novedad. Intente nuevamente.' });
      }
    });
  }

  //ACCIÓN MODIFICAR:
  accionModificarNovedad(): void {
    if (this.novedadForm.invalid || !this.empleadoCargado) {
      this.mensajeBusquedaEmpleado = !this.empleadoCargado ? 'Busque y seleccione un empleado válido.' : '';
      return;
    }
    const fv = this.novedadForm.getRawValue();
    const novedad = this.construirNovedadDesdeFormulario(fv, true);
    const nombreTipoNovedad = this.tiposNovedadesEmpleados.find(t => t.idTipoNovedadEmpleado === Number(fv.cboxIdTipoNovedadEmpleado))?.nombreTipoNovedadEmpleado;
    this.novedadesEmpleadosService.updateEmployeeIncidentHistory(novedad).subscribe({
      next: (resp: ResponseHistorialNovedadEmpleadoDTO) => {
        //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL MODIFICAR UNA NOVEDAD DE PERSONAL (VER AuditoriasSistemaService.registrarAuditoria):
        this.auditoriasSistemaService.registerSystemAudit(
          'MODIFICAR NOVEDAD DE PERSONAL',
          `Se modificó la novedad de tipo "${nombreTipoNovedad}" del empleado ${this.empleadoCargado?.nombresEmpleado} ${this.empleadoCargado?.primerApellidoEmpleado}.`
        );
        this.toastEvento.emit({ tipo: 'exito', mensaje: resp.mensaje || 'Novedad modificada con éxito.' });
        this.cerrarModal.emit();
      },
      error: (err) => {
        console.error('ERROR AL MODIFICAR NOVEDAD: ', err);
        this.toastEvento.emit({ tipo: 'error', mensaje: 'Error al modificar la novedad. Intente nuevamente.' });
      }
    });
  }

  //ACCIÓN ELIMINAR:
  accionEliminarNovedad(): void {
    const fv = this.novedadForm.getRawValue();
    const id = Number(fv.ctextIdHistorialNovedadEmpleado);
    this.novedadesEmpleadosService.deleteEmployeeIncidentHistory(id).subscribe({
      next: (resp: ResponseHistorialNovedadEmpleadoDTO) => {
        this.banderaConfirmacionEliminacion = false;
        //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL ELIMINAR UNA NOVEDAD DE PERSONAL (VER AuditoriasSistemaService.registrarAuditoria):
        this.auditoriasSistemaService.registerSystemAudit('ELIMINAR NOVEDAD DE PERSONAL', `Se eliminó la novedad de personal (ID ${id}).`);
        this.toastEvento.emit({ tipo: 'exito', mensaje: resp.mensaje || 'Novedad eliminada con éxito.' });
        this.cerrarModal.emit();
      },
      error: (err) => {
        console.error('ERROR AL ELIMINAR NOVEDAD: ', err);
        this.banderaConfirmacionEliminacion = false;
        this.toastEvento.emit({ tipo: 'error', mensaje: 'Error al eliminar la novedad. Intente nuevamente.' });
      }
    });
  }

  //CIERRA EL MODAL:
  closeModal(): void {
    this.cerrarModal.emit();
  }
}
