//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

//IMPORTACIÓN DE INTERFACES:
import { ProgramacionTurnoEmpleadoI } from '../../../../interfaces/gestion-personal/programaciones-turnos-empleados/programaciones-turnos-empleados.interface';
import { EmpleadosI } from '../../../../interfaces/gestion-personal/empleados/empleados.interface';
import { PuestoSedeEstablecimientoClienteI } from '../../../../interfaces/panel-control/gestion-establecimientos-clientes/sedes-establecimientos-clientes/puestos-sedes-establec-clientes/puestos-sedes-establec-cliente.interface';
import { TurnosI } from '../../../../interfaces/panel-control/turnos/turnos.interface';

//IMPORTACIÓN DE SERVICIOS:
import { ProgramacionesTurnosEmpleadosService } from '../../../../services/gestion-personal/programaciones-turnos-empleados/programacionesTurnosEmpleados.service';
import { EmpleadosService } from '../../../../services/gestion-personal/empleados/empleados.service';
import { PuestosSedesEstablecimientosClientesService } from '../../../../services/panel-control/gestion-establecimientos-clientes/sedes-establecimientos-clientes/puestos-sedes-establec-cliente/puestosSedesEstablecimientosClientes.service';
import { TurnosService } from '../../../../services/panel-control/turnos/turnos.service';
import { AuditoriasSistemaService } from '../../../../services/panel-control/auditorias-sistema/auditorias-sistema.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-add-upd-del-prog-turno-empleado',
  templateUrl: './add-upd-del-prog-turno-empleado.component.html',
  styleUrls: ['./add-upd-del-prog-turno-empleado.component.scss']
})
export class AddUpdDelProgTurnoEmpleadoComponent implements OnInit, OnChanges {

  //INPUTS: MODO Y DATOS DE LA PROGRAMACIÓN SELECCIONADA:
  @Input() modo: string = 'guardar';
  @Input() programacionData: ProgramacionTurnoEmpleadoI | null = null;

  //OUTPUTS: CERRAR MODAL Y TOAST:
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() toastEvento = new EventEmitter<{ tipo: string; mensaje: string }>();

  //FORMULARIO DE LA PROGRAMACIÓN:
  programacionForm!: FormGroup;
  programacion!: ProgramacionTurnoEmpleadoI;
  banderaCrudGuardar: boolean = false;
  banderaCrudModificar: boolean = false;
  banderaCrudEliminar: boolean = false;
  banderaConfirmacionEliminacion: boolean = false;
  private componenteInicializado: boolean = false;

  //LISTAS CARGADAS DESDE EL BACKEND PARA LOS COMBOS:
  opcionesEmpleados: EmpleadosI[] = [];
  opcionesPuestos: PuestoSedeEstablecimientoClienteI[] = [];
  opcionesTurnos: TurnosI[] = [];

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private programacionesTurnosEmpleadosService: ProgramacionesTurnosEmpleadosService,
    private empleadosService: EmpleadosService,
    private puestosSedesEstablecimientosClientesService: PuestosSedesEstablecimientosClientesService,
    private turnosService: TurnosService,
    private auditoriasSistemaService: AuditoriasSistemaService
  ) {}

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    this.configurarBanderas();
    this.initForm();
    this.cargarCombos();
    if (this.banderaCrudModificar || this.banderaCrudEliminar) {
      this.cargarDatosProgramacion();
    }
    this.componenteInicializado = true;
  }

  //DETECTA CAMBIOS EN LOS @Input Y RECONFIGURA EL FORMULARIO:
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.componenteInicializado) return;
    if (changes['modo'] || changes['programacionData']) {
      this.configurarBanderas();
      this.initForm();
      if (this.banderaCrudModificar || this.banderaCrudEliminar) {
        this.cargarDatosProgramacion();
      }
    }
  }

  //CONFIGURA LAS BANDERAS CRUD SEGÚN EL MODO RECIBIDO:
  configurarBanderas(): void {
    this.banderaCrudGuardar = this.modo === 'guardar';
    this.banderaCrudModificar = this.modo === 'modificar';
    this.banderaCrudEliminar = this.modo === 'eliminar';
  }

  //CARGA LOS COMBOS DE SELECCIÓN DESDE EL BACKEND:
  cargarCombos(): void {
    this.empleadosService.findAllEmployees(undefined, undefined, undefined, undefined, undefined, undefined, 'nombresEmpleado', 'ASC').subscribe({
      next: (data) => { this.opcionesEmpleados = data; },
      error: (err) => console.error('ERROR COMBO EMPLEADOS: ', err)
    });

    this.puestosSedesEstablecimientosClientesService.findAllClientEstablishmentBranchPosts(undefined, undefined, 'nombrePuestoSedeEstablecimientoCliente', 'ASC').subscribe({
      next: (data) => { this.opcionesPuestos = data; },
      error: (err) => console.error('ERROR COMBO PUESTOS: ', err)
    });

    this.turnosService.findAllShifts(undefined, undefined, 'nombreTurno', 'ASC').subscribe({
      next: (data) => { this.opcionesTurnos = data; },
      error: (err) => console.error('ERROR COMBO TURNOS: ', err)
    });
  }

  //MÉTODO DE INICIALIZACIÓN DEL FORMULARIO (VACÍO — MODO GUARDAR):
  initForm(): void {
    this.programacionForm = this.formBuilder.group({
      ctextIdProgramacionTurnoEmpleado: new FormControl(''),
      cboxIdEmpleado: new FormControl('', Validators.required),
      cboxIdPuesto: new FormControl('', Validators.required),
      cboxIdTurno: new FormControl('', Validators.required),
      ctextFechaHMSIniciacionProgramacionTurnoEmpleado: new FormControl('', Validators.required),
      ctextFechaHMSFinalizacionProgramacionTurnoEmpleado: new FormControl('', Validators.required),
      cboxEstadoProgramacionTurnoEmpleado: new FormControl('ACTIVO', Validators.required)
    });
  }

  //CARGA LOS DATOS DE LA PROGRAMACIÓN DESDE EL BACKEND Y LLENA EL FORMULARIO:
  cargarDatosProgramacion(): void {
    if (!this.programacionData?.idProgramacionTurnoEmpleado) return;
    this.programacionesTurnosEmpleadosService.getEmployeeShiftSchedulebyId(Number(this.programacionData.idProgramacionTurnoEmpleado))
      .subscribe({
        next: (respuesta) => {
          this.programacion = respuesta.programacionTurnoEmpleadoDTO;
          this.changeDetectorRef.detectChanges();
          this.chargueForm();
        },
        error: (err) => {
          console.error('ERROR AL CARGAR DATOS DE LA PROGRAMACIÓN: ', err);
          this.alertaMensajeError('Error', 'Error al cargar los datos de la programación de turno.');
        }
      });
  }

  //MÉTODO DE CARGUE DEL FORMULARIO CON DATOS DEL BACKEND (MODOS MODIFICAR Y ELIMINAR):
  chargueForm(): void {
    const p = this.programacion;
    this.programacionForm.patchValue({
      ctextIdProgramacionTurnoEmpleado: p.idProgramacionTurnoEmpleado || '',
      cboxIdEmpleado: p.empleadoDTO?.idEmpleado || '',
      cboxIdPuesto: p.puestoSedeEstablecimientoClienteDTO?.idPuestoSedeEstablecimientoCliente || '',
      cboxIdTurno: p.turnoDTO?.idTurno || '',
      ctextFechaHMSIniciacionProgramacionTurnoEmpleado: this.formatearFechaParaInput(p.fechaHMSIniciacionProgramacionTurnoEmpleado),
      ctextFechaHMSFinalizacionProgramacionTurnoEmpleado: this.formatearFechaParaInput(p.fechaHMSFinalizacionProgramacionTurnoEmpleado),
      cboxEstadoProgramacionTurnoEmpleado: p.estadoProgramacionTurnoEmpleado || 'ACTIVO'
    });
    this.changeDetectorRef.detectChanges();
  }

  //NORMALIZA UNA FECHA DEL BACKEND AL FORMATO YYYY-MM-DDTHH:mm:
  formatearFechaParaInput(fecha: any): string {
    if (!fecha) return '';
    const s = String(fecha).replace(' ', 'T');
    return s.length > 16 ? s.slice(0, 16) : s;
  }

  //CONSTRUYE EL OBJETO ProgramacionTurnoEmpleadoI DESDE LOS VALORES DEL FORMULARIO:
  private construirProgramacionDesdeFormulario(fv: any, esModificacion: boolean): ProgramacionTurnoEmpleadoI {
    const empleadoSeleccionado = this.opcionesEmpleados.find(e => e.idEmpleado === Number(fv.cboxIdEmpleado));
    const puestoSeleccionado = this.opcionesPuestos.find(p => p.idPuestoSedeEstablecimientoCliente === Number(fv.cboxIdPuesto));
    const turnoSeleccionado = this.opcionesTurnos.find(t => t.idTurno === Number(fv.cboxIdTurno));

    const obj: ProgramacionTurnoEmpleadoI = {
      fechaHMSIniciacionProgramacionTurnoEmpleado: fv.ctextFechaHMSIniciacionProgramacionTurnoEmpleado,
      fechaHMSFinalizacionProgramacionTurnoEmpleado: fv.ctextFechaHMSFinalizacionProgramacionTurnoEmpleado,
      estadoProgramacionTurnoEmpleado: fv.cboxEstadoProgramacionTurnoEmpleado,
      empleadoDTO: empleadoSeleccionado || { idEmpleado: Number(fv.cboxIdEmpleado) } as EmpleadosI,
      puestoSedeEstablecimientoClienteDTO: puestoSeleccionado || { idPuestoSedeEstablecimientoCliente: Number(fv.cboxIdPuesto) } as PuestoSedeEstablecimientoClienteI,
      turnoDTO: turnoSeleccionado || { idTurno: Number(fv.cboxIdTurno) } as TurnosI
    };
    if (esModificacion) {
      obj.idProgramacionTurnoEmpleado = Number(fv.ctextIdProgramacionTurnoEmpleado);
    }
    return obj;
  }

  //MÉTODO DE LOS CRUDS — GUARDAR, MODIFICAR O ELIMINAR REGISTRO:
  accionesGuardarModificarEliminarRegistro(formValues: any): void {
    const fv = this.programacionForm.getRawValue();

    //MODO GUARDAR:
    if (this.banderaCrudGuardar) {
      if (this.programacionForm.invalid) return;
      const nuevaProgramacion = this.construirProgramacionDesdeFormulario(fv, false);
      this.programacionesTurnosEmpleadosService.addEmployeeShiftSchedule(nuevaProgramacion).subscribe({
        next: (respuesta) => {
          if (respuesta.mensaje && respuesta.mensaje.toLowerCase().includes('éxito')) {
            //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL CREAR UNA PROGRAMACIÓN DE TURNO (VER AuditoriasSistemaService.registrarAuditoria):
            this.auditoriasSistemaService.registerSystemAudit(
              'CREAR PROGRAMACIÓN DE TURNO',
              `Se creó la programación de turno del empleado ${nuevaProgramacion.empleadoDTO?.nombresEmpleado} en el puesto ${nuevaProgramacion.puestoSedeEstablecimientoClienteDTO?.nombrePuestoSedeEstablecimientoCliente}.`
            );
            this.alertaMensajeExito('Confirmación', respuesta.mensaje);
            setTimeout(() => this.closeModal(), 500);
          } else {
            this.alertaMensajeError('Error', respuesta.mensaje || 'Error al guardar la programación de turno.');
          }
        },
        error: (err) => {
          console.error('ERROR AL GUARDAR PROGRAMACIÓN: ', err);
          this.alertaMensajeError('Error', 'Error al guardar la programación de turno.');
        }
      });
    }

    //MODO MODIFICAR:
    if (this.banderaCrudModificar) {
      if (this.programacionForm.invalid) return;
      const programacionModificada = this.construirProgramacionDesdeFormulario(fv, true);
      this.programacionesTurnosEmpleadosService.updateEmployeeShiftSchedule(programacionModificada).subscribe({
        next: (respuesta) => {
          if (respuesta.mensaje && respuesta.mensaje.toLowerCase().includes('éxito')) {
            //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL MODIFICAR UNA PROGRAMACIÓN DE TURNO (VER AuditoriasSistemaService.registrarAuditoria):
            this.auditoriasSistemaService.registerSystemAudit(
              'MODIFICAR PROGRAMACIÓN DE TURNO',
              `Se modificó la programación de turno del empleado ${programacionModificada.empleadoDTO?.nombresEmpleado} en el puesto ${programacionModificada.puestoSedeEstablecimientoClienteDTO?.nombrePuestoSedeEstablecimientoCliente}.`
            );
            this.alertaMensajeExito('Confirmación', respuesta.mensaje);
            setTimeout(() => this.closeModal(), 500);
          } else {
            this.alertaMensajeError('Error', respuesta.mensaje || 'Error al modificar la programación de turno.');
          }
        },
        error: (err) => {
          console.error('ERROR AL MODIFICAR PROGRAMACIÓN: ', err);
          this.alertaMensajeError('Error', 'Error al modificar la programación de turno.');
        }
      });
    }

    //MODO ELIMINAR — muestra el diálogo de confirmación SI/NO:
    if (this.banderaCrudEliminar) {
      this.confirmacionEliminacionRegistro();
    }
  }

  //MÉTODO QUE MUESTRA EL DIÁLOGO DE CONFIRMACIÓN DE ELIMINACIÓN:
  confirmacionEliminacionRegistro(): void {
    this.banderaConfirmacionEliminacion = true;
  }

  //MÉTODO DE LA ALERTA DE CONFIRMACIÓN SI — EJECUTA LA ELIMINACIÓN:
  siConfirmacionEliminacionRegistro(): void {
    this.banderaConfirmacionEliminacion = false;
    const fv = this.programacionForm.getRawValue();
    const idProgramacionTurnoEmpleado = Number(fv.ctextIdProgramacionTurnoEmpleado);
    this.programacionesTurnosEmpleadosService.deleteEmployeeShiftSchedule(idProgramacionTurnoEmpleado).subscribe({
      next: (respuesta) => {
        if (respuesta.mensaje && respuesta.mensaje.toLowerCase().includes('éxito')) {
          //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL ELIMINAR UNA PROGRAMACIÓN DE TURNO (VER AuditoriasSistemaService.registrarAuditoria):
          this.auditoriasSistemaService.registerSystemAudit(
            'ELIMINAR PROGRAMACIÓN DE TURNO',
            `Se eliminó la programación de turno (ID ${idProgramacionTurnoEmpleado}).`
          );
          this.alertaMensajeExito('Confirmación', respuesta.mensaje);
          setTimeout(() => this.closeModal(), 500);
        } else {
          this.alertaMensajeError('Error', respuesta.mensaje || 'Error al eliminar la programación de turno.');
        }
      },
      error: (err) => {
        console.error('ERROR AL ELIMINAR PROGRAMACIÓN: ', err);
        this.alertaMensajeError('Error', 'Error al eliminar la programación de turno.');
      }
    });
  }

  //MÉTODO DE LA ALERTA DE CONFIRMACIÓN NO — CANCELA LA ELIMINACIÓN:
  noConfirmacionEliminacionRegistro(): void {
    this.banderaConfirmacionEliminacion = false;
  }

  //MÉTODO DE ALERTA DE MENSAJE ÉXITO:
  alertaMensajeExito(titulo: string, detalle: string): void {
    this.toastEvento.emit({ tipo: 'exito', mensaje: detalle });
  }

  //MÉTODO DE ALERTA DE MENSAJE ERROR:
  alertaMensajeError(titulo: string, detalle: string): void {
    this.toastEvento.emit({ tipo: 'error', mensaje: detalle });
  }

  //MÉTODO PARA CERRAR EL MODAL:
  closeModal(): void {
    this.cerrarModal.emit();
  }
}
