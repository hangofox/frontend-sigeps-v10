//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

//IMPORTACIÓN DE INTERFACES:
import { SedeEstablecimientoClienteI } from '../../../../../interfaces/panel-control/gestion-establecimientos-clientes/sedes-establecimientos-clientes/sedes-establecimientos-clientes.interface';
import { EstablecimientoClienteI } from '../../../../../interfaces/panel-control/gestion-establecimientos-clientes/establecimientos-clientes.interface';

//IMPORTACIÓN DE SERVICIOS:
import { SedesEstablecimientosClientesService } from '../../../../../services/panel-control/gestion-establecimientos-clientes/sedes-establecimientos-clientes/sedesEstablecimientosClientes.service';
import { AuditoriasSistemaService } from '../../../../../services/panel-control/auditorias-sistema/auditorias-sistema.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-add-upd-del-sede-establec-cliente',
  templateUrl: './add-upd-del-sede-establec-cliente.component.html',
  styleUrls: ['./add-upd-del-sede-establec-cliente.component.scss']
})
export class AddUpdDelSedeEstablecClienteComponent implements OnInit, OnChanges {

  //INPUTS: MODO, DATOS DE LA SEDE SELECCIONADA Y ESTABLECIMIENTO CLIENTE PADRE:
  @Input() modo: string = 'guardar';
  @Input() sedeData: SedeEstablecimientoClienteI | null = null;
  @Input() establecimientoData: EstablecimientoClienteI | null = null;

  //OUTPUTS: CERRAR MODAL Y TOAST:
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() toastEvento = new EventEmitter<{ tipo: string; mensaje: string }>();

  //DECLARACIÓN DE VARIABLES GLOBALES:
  sedeForm!: FormGroup;
  sede!: SedeEstablecimientoClienteI;
  banderaCrudGuardar: boolean = false;
  banderaCrudModificar: boolean = false;
  banderaCrudEliminar: boolean = false;
  banderaConfirmacionEliminacion: boolean = false;
  private componenteInicializado: boolean = false;

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private sedesEstablecimientosClientesService: SedesEstablecimientosClientesService,
    private auditoriasSistemaService: AuditoriasSistemaService
  ) {}

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    this.configurarBanderas();
    this.initForm();
    if (this.banderaCrudModificar || this.banderaCrudEliminar) {
      this.cargarDatosSede();
    }
    this.componenteInicializado = true;
  }

  //DETECTA CAMBIOS EN LOS @Input Y RECONFIGURA EL FORMULARIO:
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.componenteInicializado) return;
    if (changes['modo'] || changes['sedeData']) {
      this.configurarBanderas();
      this.initForm();
      if (this.banderaCrudModificar || this.banderaCrudEliminar) {
        this.cargarDatosSede();
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
    this.sedeForm = this.formBuilder.group({
      ctextIdSedeEstablecimientoCliente: new FormControl(''),
      ctextNombreSedeEstablecimientoCliente: new FormControl('', Validators.required),
      ctextDireccionSedeEstablecimientoCliente: new FormControl('', Validators.required),
      ctextTelefonoSedeEstablecimientoCliente: new FormControl('', Validators.required),
      ctextMovilSedeEstablecimientoCliente: new FormControl('', Validators.required),
      ctextCorreoElectronicoInstitucionalSedeEstablecimientoCliente: new FormControl(''),
      ctextPaisOrigenSedeEstablecimientoCliente: new FormControl(''),
      ctextDepartamentooEstadoOrigenSedeEstablecimientoCliente: new FormControl(''),
      ctextCiudadOrigenSedeEstablecimientoCliente: new FormControl('', Validators.required),
      ctextFechaHMSIngresoSedeEstablecimientoCliente: new FormControl({ value: this.obtenerFechaHoraActual(), disabled: true }),
      ctextFechaHMSModificacionSedeEstablecimientoCliente: new FormControl({ value: '', disabled: true }),
      cboxEstadoSedeEstablecimientoCliente: new FormControl('ACTIVO', Validators.required)
    });
  }

  //CARGA LOS DATOS DE LA SEDE DESDE EL BACKEND Y LLENA EL FORMULARIO:
  cargarDatosSede(): void {
    if (!this.sedeData?.idSedeEstablecimientoCliente) return;
    this.sedesEstablecimientosClientesService.getClientEstablishmentBranchbyId(Number(this.sedeData.idSedeEstablecimientoCliente))
      .subscribe({
        next: (respuesta) => {
          this.sede = respuesta.sedeEstablecimientoClienteDTO;
          this.changeDetectorRef.detectChanges();
          this.chargueForm();
        },
        error: (err) => {
          console.error('ERROR AL CARGAR DATOS DE LA SEDE: ', err);
          this.alertaMensajeError('Error', 'Error al cargar los datos de la sede.');
        }
      });
  }

  //MÉTODO DE CARGUE DEL FORMULARIO CON DATOS DEL BACKEND (MODOS MODIFICAR Y ELIMINAR):
  chargueForm(): void {
    const s = this.sede;
    this.sedeForm.patchValue({
      ctextIdSedeEstablecimientoCliente: s.idSedeEstablecimientoCliente || '',
      ctextNombreSedeEstablecimientoCliente: s.nombreSedeEstablecimientoCliente || '',
      ctextDireccionSedeEstablecimientoCliente: s.direccionSedeEstablecimientoCliente || '',
      ctextTelefonoSedeEstablecimientoCliente: s.telefonoSedeEstablecimientoCliente || '',
      ctextMovilSedeEstablecimientoCliente: s.movilSedeEstablecimientoCliente || '',
      ctextCorreoElectronicoInstitucionalSedeEstablecimientoCliente: s.correoElectronicoInstitucionalSedeEstablecimientoCliente || '',
      ctextPaisOrigenSedeEstablecimientoCliente: s.paisOrigenSedeEstablecimientoCliente || '',
      ctextDepartamentooEstadoOrigenSedeEstablecimientoCliente: s.departamentooEstadoOrigenSedeEstablecimientoCliente || '',
      ctextCiudadOrigenSedeEstablecimientoCliente: s.ciudadOrigenSedeEstablecimientoCliente || '',
      ctextFechaHMSIngresoSedeEstablecimientoCliente: this.formatearFechaParaInput(s.fechaHMSIngresoSedeEstablecimientoCliente),
      ctextFechaHMSModificacionSedeEstablecimientoCliente: this.obtenerFechaHoraActual(),
      cboxEstadoSedeEstablecimientoCliente: s.estadoSedeEstablecimientoCliente || 'ACTIVO'
    });
    this.changeDetectorRef.detectChanges();
  }

  //RETORNA LA FECHA Y HORA ACTUAL EN FORMATO YYYY-MM-DDTHH:mm:
  obtenerFechaHoraActual(): string {
    return new Date().toISOString().slice(0, 16);
  }

  //NORMALIZA UNA FECHA DEL BACKEND AL FORMATO YYYY-MM-DDTHH:mm:
  formatearFechaParaInput(fecha: any): string {
    if (!fecha) return '';
    const s = String(fecha).replace(' ', 'T');
    return s.length > 16 ? s.slice(0, 16) : s;
  }

  //CONSTRUYE EL OBJETO SedeEstablecimientoClienteI DESDE LOS VALORES DEL FORMULARIO:
  private construirSedeDesdeFormulario(fv: any, esModificacion: boolean): SedeEstablecimientoClienteI {
    const obj: SedeEstablecimientoClienteI = {
      nombreSedeEstablecimientoCliente: fv.ctextNombreSedeEstablecimientoCliente,
      direccionSedeEstablecimientoCliente: fv.ctextDireccionSedeEstablecimientoCliente,
      telefonoSedeEstablecimientoCliente: fv.ctextTelefonoSedeEstablecimientoCliente,
      movilSedeEstablecimientoCliente: fv.ctextMovilSedeEstablecimientoCliente,
      correoElectronicoInstitucionalSedeEstablecimientoCliente: fv.ctextCorreoElectronicoInstitucionalSedeEstablecimientoCliente || '',
      paisOrigenSedeEstablecimientoCliente: fv.ctextPaisOrigenSedeEstablecimientoCliente || '',
      departamentooEstadoOrigenSedeEstablecimientoCliente: fv.ctextDepartamentooEstadoOrigenSedeEstablecimientoCliente || '',
      ciudadOrigenSedeEstablecimientoCliente: fv.ctextCiudadOrigenSedeEstablecimientoCliente,
      fechaHMSIngresoSedeEstablecimientoCliente: fv.ctextFechaHMSIngresoSedeEstablecimientoCliente || this.obtenerFechaHoraActual(),
      fechaHMSModificacionSedeEstablecimientoCliente: esModificacion ? this.obtenerFechaHoraActual() : '',
      estadoSedeEstablecimientoCliente: fv.cboxEstadoSedeEstablecimientoCliente,
      establecimientoClienteDTO: {
        idEstablecimientoCliente: this.establecimientoData?.idEstablecimientoCliente,
        numeroDocumentoIdentificacionEstablecimientoCliente: '',
        nombreRazonSocialEstablecimientoCliente: '',
        fechaHMSIngresoEstablecimientoCliente: '',
        fechaHMSModificacionEstablecimientoCliente: '',
        estadoEstablecimientoCliente: '',
        tipoDocumentoIdentificacionDTO: { idTipoDocumentoIdentificacion: 0, nombreTipoDocumentoIdentificacion: '' }
      }
    };
    if (esModificacion) {
      obj.idSedeEstablecimientoCliente = Number(fv.ctextIdSedeEstablecimientoCliente);
    }
    return obj;
  }

  //MÉTODO DE LOS CRUDS — GUARDAR, MODIFICAR O ELIMINAR REGISTRO:
  accionesGuardarModificarEliminarRegistro(formValues: any): void {
    const fv = this.sedeForm.getRawValue();

    //MODO GUARDAR:
    if (this.banderaCrudGuardar) {
      if (this.sedeForm.invalid) return;
      const nuevaSede = this.construirSedeDesdeFormulario(fv, false);
      this.sedesEstablecimientosClientesService.addClientEstablishmentBranch(nuevaSede).subscribe({
        next: (respuesta) => {
          if (respuesta.mensaje && respuesta.mensaje.toLowerCase().includes('éxito')) {
            //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL CREAR UNA SEDE (VER AuditoriasSistemaService.registrarAuditoria):
            this.auditoriasSistemaService.registerSystemAudit('CREAR SEDE', `Se creó la sede ${nuevaSede.nombreSedeEstablecimientoCliente}.`);
            this.alertaMensajeExito('Confirmación', respuesta.mensaje);
            setTimeout(() => this.closeModal(), 500);
          } else {
            this.alertaMensajeError('Error', respuesta.mensaje || 'Error al guardar la sede.');
          }
        },
        error: (err) => {
          console.error('ERROR AL GUARDAR SEDE: ', err);
          this.alertaMensajeError('Error', 'Error al guardar la sede.');
        }
      });
    }

    //MODO MODIFICAR:
    if (this.banderaCrudModificar) {
      if (this.sedeForm.invalid) return;
      const sedeModificada = this.construirSedeDesdeFormulario(fv, true);
      this.sedesEstablecimientosClientesService.updateClientEstablishmentBranch(sedeModificada).subscribe({
        next: (respuesta) => {
          if (respuesta.mensaje && respuesta.mensaje.toLowerCase().includes('éxito')) {
            //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL MODIFICAR UNA SEDE (VER AuditoriasSistemaService.registrarAuditoria):
            this.auditoriasSistemaService.registerSystemAudit('MODIFICAR SEDE', `Se modificó la sede ${sedeModificada.nombreSedeEstablecimientoCliente}.`);
            this.alertaMensajeExito('Confirmación', respuesta.mensaje);
            setTimeout(() => this.closeModal(), 500);
          } else {
            this.alertaMensajeError('Error', respuesta.mensaje || 'Error al modificar la sede.');
          }
        },
        error: (err) => {
          console.error('ERROR AL MODIFICAR SEDE: ', err);
          this.alertaMensajeError('Error', 'Error al modificar la sede.');
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
    const fv = this.sedeForm.getRawValue();
    const idSedeEstablecimientoCliente = Number(fv.ctextIdSedeEstablecimientoCliente);
    this.sedesEstablecimientosClientesService.deleteClientEstablishmentBranch(idSedeEstablecimientoCliente).subscribe({
      next: (respuesta) => {
        if (respuesta.mensaje && respuesta.mensaje.toLowerCase().includes('éxito')) {
          //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL ELIMINAR UNA SEDE (VER AuditoriasSistemaService.registrarAuditoria):
          this.auditoriasSistemaService.registerSystemAudit('ELIMINAR SEDE', `Se eliminó la sede ${fv.ctextNombreSedeEstablecimientoCliente}.`);
          this.alertaMensajeExito('Confirmación', respuesta.mensaje);
          setTimeout(() => this.closeModal(), 500);
        } else {
          this.alertaMensajeError('Error', respuesta.mensaje || 'Error al eliminar la sede.');
        }
      },
      error: (err) => {
        console.error('ERROR AL ELIMINAR SEDE: ', err);
        this.alertaMensajeError('Error', 'Error al eliminar la sede.');
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
