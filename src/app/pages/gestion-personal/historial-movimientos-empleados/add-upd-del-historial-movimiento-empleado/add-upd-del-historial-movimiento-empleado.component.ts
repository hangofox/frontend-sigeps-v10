//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

//IMPORTACIÓN DE INTERFACES:
import { HistorialMovimientosEmpleadosI } from '../../../../interfaces/gestion-personal/historial-movimientos-empleados/historialMovimientosEmpleados.interface';
import { ResponseHistorialMovimientoEmpleadoDTO } from '../../../../interfaces/gestion-personal/historial-movimientos-empleados/responseHistorialMovimientoEmpleadoDTO.interface';
import { TipoMovimientoI } from '../../../../interfaces/gestion-personal/tipos-movimientos-empleados/tipos-movimientos-empleados.interface';
import { ProgramacionTurnoEmpleadoI } from '../../../../interfaces/gestion-personal/programaciones-turnos-empleados/programaciones-turnos-empleados.interface';
import { EmpleadosI } from '../../../../interfaces/gestion-personal/empleados/empleados.interface';

//IMPORTACIÓN DE SERVICIOS:
import { HistorialMovimientosEmpleadosService } from '../../../../services/gestion-personal/historial-movimientos-empleados/historialMovimientosEmpleados.service';
import { TiposMovimientosEmpleadosService } from '../../../../services/gestion-personal/tipos-movimientos-empleados/tiposMovimientosEmpleados.service';
import { ProgramacionesTurnosEmpleadosService } from '../../../../services/gestion-personal/programaciones-turnos-empleados/programacionesTurnosEmpleados.service';
import { EmpleadosService } from '../../../../services/gestion-personal/empleados/empleados.service';
import { AuditoriasSistemaService } from '../../../../services/panel-control/auditorias-sistema/auditorias-sistema.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-add-upd-del-historial-movimiento-empleado',
  templateUrl: './add-upd-del-historial-movimiento-empleado.component.html',
  styleUrls: ['./add-upd-del-historial-movimiento-empleado.component.scss']
})
export class AddUpdDelHistorialMovimientoEmpleadoComponent implements OnInit, OnChanges {

  @Input() modo: string = 'guardar';
  @Input() movimientoData: HistorialMovimientosEmpleadosI | null = null;
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() toastEvento = new EventEmitter<{ tipo: string; mensaje: string }>();

  movimientoForm!: FormGroup;
  banderaCrudGuardar: boolean = false;
  banderaCrudModificar: boolean = false;
  banderaCrudEliminar: boolean = false;
  banderaConfirmacionEliminacion: boolean = false;
  mensajeBusquedaEmpleado: string = '';
  private componenteInicializado: boolean = false;
  private empleadoCargado: EmpleadosI | null = null;
  tiposMovimiento: TipoMovimientoI[] = [];
  programacionesTurnos: ProgramacionTurnoEmpleadoI[] = [];

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    private historialMovimientosEmpleadosService: HistorialMovimientosEmpleadosService,
    private tiposMovimientosEmpleadosService: TiposMovimientosEmpleadosService,
    private programacionesTurnosEmpleadosService: ProgramacionesTurnosEmpleadosService,
    private empleadosService: EmpleadosService,
    private auditoriasSistemaService: AuditoriasSistemaService
  ) {}

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    this.configurarBanderas();
    this.initForm();
    this.cargarCombos();
    if (this.modo !== 'guardar' && this.movimientoData) {
      this.chargueForm();
    }
    this.componenteInicializado = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.componenteInicializado) return;
    if (changes['movimientoData'] || changes['modo']) {
      this.configurarBanderas();
      this.initForm();
      if (this.modo !== 'guardar' && this.movimientoData) {
        this.chargueForm();
      }
    }
  }

  //CONFIGURA LAS BANDERAS DEL MODO CRUD:
  configurarBanderas(): void {
    this.banderaCrudGuardar = this.modo === 'guardar';
    this.banderaCrudModificar = this.modo === 'modificar';
    this.banderaCrudEliminar = this.modo === 'eliminar';
  }

  //MÉTODO DE INICIALIZACIÓN DEL FORMULARIO:
  initForm(): void {
    this.movimientoForm = this.formBuilder.group({
      ctextIdHistorialMovimientoEmpleado: new FormControl(''),
      ctextNumeroDocumentoIdentificacionEmpleado: new FormControl('', Validators.required),
      ctextNombreCompletoEmpleado: new FormControl({ value: '', disabled: true }),
      cboxIdTipoMovimiento: new FormControl('', Validators.required),
      cboxIdProgramacionTurnoEmpleado: new FormControl('', Validators.required),
      ctextFechaHMSHistorialMovimientoEmpleado: new FormControl('', Validators.required)
    });
    this.mensajeBusquedaEmpleado = '';
    this.empleadoCargado = null;
  }

  //CARGA LOS COMBOS DESDE EL BACKEND:
  cargarCombos(): void {
    this.tiposMovimientosEmpleadosService.findAllTypesOfEmployeeMovements(undefined, undefined, 'nombreTipoMovimiento', 'ASC')
      .subscribe({
        next: (data) => this.tiposMovimiento = data,
        error: (err) => console.error('ERROR AL CARGAR TIPOS DE MOVIMIENTO: ', err)
      });

    this.programacionesTurnosEmpleadosService.findAllEmployeeShiftSchedules(undefined, undefined, 'idProgramacionTurnoEmpleado', 'ASC')
      .subscribe({
        next: (data) => this.programacionesTurnos = data,
        error: (err) => console.error('ERROR AL CARGAR PROGRAMACIONES: ', err)
      });
  }

  //PUEBLA EL FORMULARIO CON LOS DATOS DEL MOVIMIENTO A MODIFICAR/ELIMINAR:
  chargueForm(): void {
    const m = this.movimientoData!;
    this.empleadoCargado = m.empleadoDTO;
    this.movimientoForm = this.formBuilder.group({
      ctextIdHistorialMovimientoEmpleado: new FormControl(m.idHistorialMovimientoEmpleado || ''),
      ctextNumeroDocumentoIdentificacionEmpleado: new FormControl(m.empleadoDTO?.numeroDocumentoIdentificacionEmpleado || '', Validators.required),
      ctextNombreCompletoEmpleado: new FormControl({ value: `${m.empleadoDTO?.nombresEmpleado || ''} ${m.empleadoDTO?.primerApellidoEmpleado || ''} ${m.empleadoDTO?.segundoApellidoEmpleado || ''}`.trim(), disabled: true }),
      cboxIdTipoMovimiento: new FormControl(m.tipoMovimientoDTO?.idTipoMovimiento || '', Validators.required),
      cboxIdProgramacionTurnoEmpleado: new FormControl(m.programacionTurnoEmpleadoDTO?.idProgramacionTurnoEmpleado || '', Validators.required),
      ctextFechaHMSHistorialMovimientoEmpleado: new FormControl(this.formatearFechaParaInput(m.fechaHMSHistorialMovimientoEmpleado), Validators.required)
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
    const doc = (this.movimientoForm.get('ctextNumeroDocumentoIdentificacionEmpleado')?.value || '').trim();
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
          this.movimientoForm.patchValue({ ctextNombreCompletoEmpleado: nombreCompleto });
          this.mensajeBusquedaEmpleado = '';
        } else {
          this.empleadoCargado = null;
          this.movimientoForm.patchValue({ ctextNombreCompletoEmpleado: '' });
          this.mensajeBusquedaEmpleado = 'No se encontró el empleado.';
        }
      },
      error: () => {
        this.empleadoCargado = null;
        this.movimientoForm.patchValue({ ctextNombreCompletoEmpleado: '' });
        this.mensajeBusquedaEmpleado = 'No se encontró el empleado.';
      }
    });
  }

  //CONSTRUYE EL DTO DE MOVIMIENTO DESDE LOS VALORES DEL FORMULARIO:
  construirMovimientoDesdeFormulario(fv: any, esModificacion: boolean): HistorialMovimientosEmpleadosI {
    const programacionSeleccionada = this.programacionesTurnos.find(
      p => p.idProgramacionTurnoEmpleado === Number(fv.cboxIdProgramacionTurnoEmpleado)
    ) || { idProgramacionTurnoEmpleado: Number(fv.cboxIdProgramacionTurnoEmpleado) } as ProgramacionTurnoEmpleadoI;

    return {
      ...(esModificacion ? { idHistorialMovimientoEmpleado: Number(fv.ctextIdHistorialMovimientoEmpleado) } : {}),
      fechaHMSHistorialMovimientoEmpleado: fv.ctextFechaHMSHistorialMovimientoEmpleado,
      empleadoDTO: this.empleadoCargado!,
      programacionTurnoEmpleadoDTO: programacionSeleccionada,
      tipoMovimientoDTO: {
        idTipoMovimiento: Number(fv.cboxIdTipoMovimiento),
        nombreTipoMovimiento: ''
      }
    };
  }

  //ACCIÓN GUARDAR:
  accionGuardarMovimiento(): void {
    if (this.movimientoForm.invalid || !this.empleadoCargado) {
      this.mensajeBusquedaEmpleado = !this.empleadoCargado ? 'Busque y seleccione un empleado válido.' : '';
      return;
    }
    const fv = this.movimientoForm.getRawValue();
    const movimiento = this.construirMovimientoDesdeFormulario(fv, false);
    const nombreTipoMovimiento = this.tiposMovimiento.find(t => t.idTipoMovimiento === Number(fv.cboxIdTipoMovimiento))?.nombreTipoMovimiento;
    this.historialMovimientosEmpleadosService.addEmployeeMovementHistory(movimiento).subscribe({
      next: (resp: ResponseHistorialMovimientoEmpleadoDTO) => {
        //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL CREAR UN MOVIMIENTO DE PERSONAL (VER AuditoriasSistemaService.registrarAuditoria):
        this.auditoriasSistemaService.registerSystemAudit(
          'CREAR MOVIMIENTO DE PERSONAL',
          `Se registró un movimiento de tipo "${nombreTipoMovimiento}" para el empleado ${this.empleadoCargado?.nombresEmpleado} ${this.empleadoCargado?.primerApellidoEmpleado}.`
        );
        this.toastEvento.emit({ tipo: 'exito', mensaje: resp.mensaje || 'Movimiento registrado con éxito.' });
        this.cerrarModal.emit();
      },
      error: (err) => {
        console.error('ERROR AL GUARDAR MOVIMIENTO: ', err);
        this.toastEvento.emit({ tipo: 'error', mensaje: 'Error al registrar el movimiento. Intente nuevamente.' });
      }
    });
  }

  //ACCIÓN MODIFICAR:
  accionModificarMovimiento(): void {
    if (this.movimientoForm.invalid || !this.empleadoCargado) {
      this.mensajeBusquedaEmpleado = !this.empleadoCargado ? 'Busque y seleccione un empleado válido.' : '';
      return;
    }
    const fv = this.movimientoForm.getRawValue();
    const movimiento = this.construirMovimientoDesdeFormulario(fv, true);
    const nombreTipoMovimiento = this.tiposMovimiento.find(t => t.idTipoMovimiento === Number(fv.cboxIdTipoMovimiento))?.nombreTipoMovimiento;
    this.historialMovimientosEmpleadosService.updateEmployeeMovementHistory(movimiento).subscribe({
      next: (resp: ResponseHistorialMovimientoEmpleadoDTO) => {
        //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL MODIFICAR UN MOVIMIENTO DE PERSONAL (VER AuditoriasSistemaService.registrarAuditoria):
        this.auditoriasSistemaService.registerSystemAudit(
          'MODIFICAR MOVIMIENTO DE PERSONAL',
          `Se modificó el movimiento de tipo "${nombreTipoMovimiento}" del empleado ${this.empleadoCargado?.nombresEmpleado} ${this.empleadoCargado?.primerApellidoEmpleado}.`
        );
        this.toastEvento.emit({ tipo: 'exito', mensaje: resp.mensaje || 'Movimiento modificado con éxito.' });
        this.cerrarModal.emit();
      },
      error: (err) => {
        console.error('ERROR AL MODIFICAR MOVIMIENTO: ', err);
        this.toastEvento.emit({ tipo: 'error', mensaje: 'Error al modificar el movimiento. Intente nuevamente.' });
      }
    });
  }

  //ACCIÓN ELIMINAR:
  accionEliminarMovimiento(): void {
    const fv = this.movimientoForm.getRawValue();
    const id = Number(fv.ctextIdHistorialMovimientoEmpleado);
    this.historialMovimientosEmpleadosService.deleteEmployeeMovementHistory(id).subscribe({
      next: (resp: ResponseHistorialMovimientoEmpleadoDTO) => {
        this.banderaConfirmacionEliminacion = false;
        //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL ELIMINAR UN MOVIMIENTO DE PERSONAL (VER AuditoriasSistemaService.registrarAuditoria):
        this.auditoriasSistemaService.registerSystemAudit('ELIMINAR MOVIMIENTO DE PERSONAL', `Se eliminó el movimiento de personal (ID ${id}).`);
        this.toastEvento.emit({ tipo: 'exito', mensaje: resp.mensaje || 'Movimiento eliminado con éxito.' });
        this.cerrarModal.emit();
      },
      error: (err) => {
        console.error('ERROR AL ELIMINAR MOVIMIENTO: ', err);
        this.banderaConfirmacionEliminacion = false;
        this.toastEvento.emit({ tipo: 'error', mensaje: 'Error al eliminar el movimiento. Intente nuevamente.' });
      }
    });
  }

  //CIERRA EL MODAL:
  closeModal(): void {
    this.cerrarModal.emit();
  }
}
