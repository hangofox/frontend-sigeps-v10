//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

//IMPORTACIÓN DE INTERFACES:
import { TurnosI } from '../../../../interfaces/panel-control/turnos/turnos.interface';

//IMPORTACIÓN DE SERVICIOS:
import { TurnosService } from '../../../../services/panel-control/turnos/turnos.service';
import { AuditoriasSistemaService } from '../../../../services/panel-control/auditorias-sistema/auditorias-sistema.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-add-upd-del-turno',
  templateUrl: './add-upd-del-turno.component.html',
  styleUrls: ['./add-upd-del-turno.component.scss']
})
export class AddUpdDelTurnoComponent implements OnInit, OnChanges {

  //INPUTS: MODO Y DATOS DEL TURNO SELECCIONADO:
  @Input() modo: string = 'guardar';
  @Input() turnoData: TurnosI | null = null;

  //OUTPUTS: CERRAR MODAL Y TOAST:
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() toastEvento = new EventEmitter<{ tipo: string; mensaje: string }>();

  //DECLARACIÓN DE VARIABLES GLOBALES:
  turnoForm!: FormGroup;
  turno!: TurnosI;
  banderaCrudGuardar: boolean = false;
  banderaCrudModificar: boolean = false;
  banderaCrudEliminar: boolean = false;
  banderaConfirmacionEliminacion: boolean = false;
  private componenteInicializado: boolean = false;

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private formBuilder: FormBuilder,
    private turnosService: TurnosService,
    private auditoriasSistemaService: AuditoriasSistemaService
  ) {}

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    this.configurarBanderas();
    this.initForm();
    if (this.banderaCrudModificar || this.banderaCrudEliminar) {
      this.cargarDatosTurno();
    }
    this.componenteInicializado = true;
  }

  //DETECTA CAMBIOS EN LOS @Input Y RECONFIGURA EL FORMULARIO:
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.componenteInicializado) return;
    if (changes['modo'] || changes['turnoData']) {
      this.configurarBanderas();
      this.initForm();
      if (this.banderaCrudModificar || this.banderaCrudEliminar) {
        this.cargarDatosTurno();
      }
    }
  }

  //CONFIGURA LAS BANDERAS CRUD SEGÚN EL MODO RECIBIDO:
  configurarBanderas(): void {
    this.banderaCrudGuardar = this.modo === 'guardar';
    this.banderaCrudModificar = this.modo === 'modificar';
    this.banderaCrudEliminar = this.modo === 'eliminar';
  }

  //MÉTODO DE INICIALIZACIÓN DEL FORMULARIO (VACÍO — MODO GUARDAR):
  initForm(): void {
    this.turnoForm = this.formBuilder.group({
      ctextIdTurno: new FormControl(''),
      ctextNombreTurno: new FormControl('', Validators.required),
      ctextHmsiniciacionTurno: new FormControl('', Validators.required),
      ctextHmsfinalizacionTurno: new FormControl('', Validators.required),
      cboxEstadoTurno: new FormControl('ACTIVO', Validators.required)
    });
  }

  //CARGA LOS DATOS DEL TURNO DESDE EL BACKEND Y LLENA EL FORMULARIO:
  cargarDatosTurno(): void {
    if (!this.turnoData?.idTurno) return;
    this.turnosService.getShiftbyId(Number(this.turnoData.idTurno))
      .subscribe({
        next: (respuesta) => {
          this.turno = respuesta.turnoDTO;
          this.turnoForm.patchValue({
            ctextIdTurno: this.turno.idTurno || '',
            ctextNombreTurno: this.turno.nombreTurno || '',
            ctextHmsiniciacionTurno: this.formatearHora(this.turno.hmsiniciacionTurno),
            ctextHmsfinalizacionTurno: this.formatearHora(this.turno.hmsfinalizacionTurno),
            cboxEstadoTurno: this.turno.estadoTurno || 'ACTIVO'
          });
        },
        error: (err) => console.error('ERROR AL CARGAR DATOS DEL TURNO: ', err)
      });
  }

  //NORMALIZA LA HORA DEL BACKEND (HH:mm:ss) AL FORMATO DEL INPUT TIME (HH:mm):
  formatearHora(hora: any): string {
    if (!hora) return '';
    const s = String(hora);
    return s.length >= 5 ? s.slice(0, 5) : s;
  }

  //ASEGURA QUE LA HORA TENGA SEGUNDOS (HH:mm → HH:mm:ss) ANTES DE ENVIAR AL BACKEND:
  normalizarHoraParaBackend(hora: string): string {
    if (!hora) return '';
    return hora.length === 5 ? hora + ':00' : hora;
  }

  //MÉTODO DE LOS CRUDS — GUARDAR, MODIFICAR O ELIMINAR REGISTRO:
  accionesGuardarModificarEliminarRegistro(formValues: any): void {
    const fv = this.turnoForm.getRawValue();

    //MODO GUARDAR:
    if (this.banderaCrudGuardar) {
      if (this.turnoForm.invalid) return;
      const nuevoTurno: TurnosI = {
        nombreTurno: fv.ctextNombreTurno,
        hmsiniciacionTurno: this.normalizarHoraParaBackend(fv.ctextHmsiniciacionTurno),
        hmsfinalizacionTurno: this.normalizarHoraParaBackend(fv.ctextHmsfinalizacionTurno),
        estadoTurno: fv.cboxEstadoTurno
      };
      this.turnosService.addShift(nuevoTurno).subscribe({
        next: (respuesta) => {
          if (respuesta.mensaje && respuesta.mensaje.toLowerCase().includes('éxito')) {
            //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL CREAR UN TURNO (VER AuditoriasSistemaService.registrarAuditoria):
            this.auditoriasSistemaService.registerSystemAudit('CREAR TURNO', `Se creó el turno ${nuevoTurno.nombreTurno}.`);
            this.alertaMensajeExito('Confirmación', respuesta.mensaje);
            setTimeout(() => this.closeModal(), 500);
          } else {
            this.alertaMensajeError('Error', respuesta.mensaje || 'Error al guardar el turno.');
          }
        },
        error: (err) => {
          console.error('ERROR AL GUARDAR TURNO: ', err);
          this.alertaMensajeError('Error', 'Error al guardar el turno.');
        }
      });
    }

    //MODO MODIFICAR:
    if (this.banderaCrudModificar) {
      if (this.turnoForm.invalid) return;
      const turnoModificado: TurnosI = {
        idTurno: Number(fv.ctextIdTurno),
        nombreTurno: fv.ctextNombreTurno,
        hmsiniciacionTurno: this.normalizarHoraParaBackend(fv.ctextHmsiniciacionTurno),
        hmsfinalizacionTurno: this.normalizarHoraParaBackend(fv.ctextHmsfinalizacionTurno),
        estadoTurno: fv.cboxEstadoTurno
      };
      this.turnosService.updateShift(turnoModificado).subscribe({
        next: (respuesta) => {
          if (respuesta.mensaje && respuesta.mensaje.toLowerCase().includes('éxito')) {
            //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL MODIFICAR UN TURNO (VER AuditoriasSistemaService.registrarAuditoria):
            this.auditoriasSistemaService.registerSystemAudit('MODIFICAR TURNO', `Se modificó el turno ${turnoModificado.nombreTurno}.`);
            this.alertaMensajeExito('Confirmación', respuesta.mensaje);
            setTimeout(() => this.closeModal(), 500);
          } else {
            this.alertaMensajeError('Error', respuesta.mensaje || 'Error al modificar el turno.');
          }
        },
        error: (err) => {
          console.error('ERROR AL MODIFICAR TURNO: ', err);
          this.alertaMensajeError('Error', 'Error al modificar el turno.');
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
    const fv = this.turnoForm.getRawValue();
    const idTurno = Number(fv.ctextIdTurno);
    this.turnosService.deleteShift(idTurno).subscribe({
      next: (respuesta) => {
        if (respuesta.mensaje && respuesta.mensaje.toLowerCase().includes('éxito')) {
          //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL ELIMINAR UN TURNO (VER AuditoriasSistemaService.registrarAuditoria):
          this.auditoriasSistemaService.registerSystemAudit('ELIMINAR TURNO', `Se eliminó el turno ${fv.ctextNombreTurno}.`);
          this.alertaMensajeExito('Confirmación', respuesta.mensaje);
          setTimeout(() => this.closeModal(), 500);
        } else {
          this.alertaMensajeError('Error', respuesta.mensaje || 'Error al eliminar el turno.');
        }
      },
      error: (err) => {
        console.error('ERROR AL ELIMINAR TURNO: ', err);
        this.alertaMensajeError('Error', 'Error al eliminar el turno.');
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
