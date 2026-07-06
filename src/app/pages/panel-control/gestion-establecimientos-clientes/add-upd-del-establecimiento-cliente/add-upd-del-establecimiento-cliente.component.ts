//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

//IMPORTACIÓN DE INTERFACES:
import { EstablecimientoClienteI } from '../../../../interfaces/panel-control/gestion-establecimientos-clientes/establecimientos-clientes.interface';
import { TiposDocumentosIdentificacionI } from '../../../../interfaces/tipos-documentos-identificacion/tipos-documentos-identificacion.interface';

//IMPORTACIÓN DE SERVICIOS:
import { EstablecimientosClientesService } from '../../../../services/panel-control/gestion-establecimientos-clientes/establecimientosClientes.service';
import { TiposDocumentosIdentificacionService } from '../../../../services/tipos-documentos-identificacion/tipos-documentos-identificacion.service';
import { AuditoriasSistemaService } from '../../../../services/panel-control/auditorias-sistema/auditorias-sistema.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-add-upd-del-establecimiento-cliente',
  templateUrl: './add-upd-del-establecimiento-cliente.component.html',
  styleUrls: ['./add-upd-del-establecimiento-cliente.component.scss']
})
export class AddUpdDelEstablecimientoClienteComponent implements OnInit, OnChanges {

  //INPUTS: MODO Y DATOS DEL ESTABLECIMIENTO SELECCIONADO:
  @Input() modo: string = 'guardar';
  @Input() establecimientoData: EstablecimientoClienteI | null = null;

  //OUTPUTS: CERRAR MODAL Y TOAST:
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() toastEvento = new EventEmitter<{ tipo: string; mensaje: string }>();

  //DECLARACIÓN DE VARIABLES GLOBALES:
  establecimientoForm!: FormGroup;
  establecimiento!: EstablecimientoClienteI;
  banderaCrudGuardar: boolean = false;
  banderaCrudModificar: boolean = false;
  banderaCrudEliminar: boolean = false;
  banderaConfirmacionEliminacion: boolean = false;
  private componenteInicializado: boolean = false;

  //LISTAS CARGADAS DESDE EL BACKEND:
  tiposDocumentosIdentificacion: TiposDocumentosIdentificacionI[] = [];

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private establecimientosClientesService: EstablecimientosClientesService,
    private tiposDocumentosIdentificacionService: TiposDocumentosIdentificacionService,
    private auditoriasSistemaService: AuditoriasSistemaService
  ) {}

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    this.configurarBanderas();
    this.initForm();
    this.cargarCombos();
    if (this.banderaCrudModificar || this.banderaCrudEliminar) {
      this.cargarDatosEstablecimiento();
    }
    this.componenteInicializado = true;
  }

  //DETECTA CAMBIOS EN LOS @Input Y RECONFIGURA EL FORMULARIO:
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.componenteInicializado) return;
    if (changes['modo'] || changes['establecimientoData']) {
      this.configurarBanderas();
      this.initForm();
      if (this.banderaCrudModificar || this.banderaCrudEliminar) {
        this.cargarDatosEstablecimiento();
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
    this.tiposDocumentosIdentificacionService
      .findAllTypesOfIdentificationDocuments(undefined, undefined, 'nombreTipoDocumentoIdentificacion', 'ASC')
      .subscribe({
        next: (data: TiposDocumentosIdentificacionI[]) => { this.tiposDocumentosIdentificacion = data; },
        error: (err: any) => console.error('ERROR AL CARGAR TIPOS DE DOCUMENTO: ', err)
      });
  }

  //MÉTODO DE INICIALIZACIÓN DEL FORMULARIO (VACÍO — MODO GUARDAR):
  initForm(): void {
    this.establecimientoForm = this.formBuilder.group({
      ctextIdEstablecimientoCliente: new FormControl(''),
      cboxIdTipoDocumentoIdentificacionSeleccionado: new FormControl('', Validators.required),
      ctextNumeroDocumentoIdentificacionEstablecimientoCliente: new FormControl('', Validators.required),
      ctextNombreRazonSocialEstablecimientoCliente: new FormControl('', Validators.required),
      ctextFechaHMSIngresoEstablecimientoCliente: new FormControl({ value: this.obtenerFechaHoraActual(), disabled: true }),
      ctextFechaHMSModificacionEstablecimientoCliente: new FormControl({ value: '', disabled: true }),
      cboxEstadoEstablecimientoCliente: new FormControl('ACTIVO', Validators.required)
    });
  }

  //CARGA LOS DATOS DEL ESTABLECIMIENTO DESDE EL BACKEND Y LLENA EL FORMULARIO:
  cargarDatosEstablecimiento(): void {
    if (!this.establecimientoData?.idEstablecimientoCliente) return;
    this.establecimientosClientesService.getClientEstablishmentbyId(Number(this.establecimientoData.idEstablecimientoCliente))
      .subscribe({
        next: (respuesta) => {
          this.establecimiento = respuesta.establecimientoClienteDTO;
          this.changeDetectorRef.detectChanges();
          this.chargueForm();
        },
        error: (err) => {
          console.error('ERROR AL CARGAR DATOS DEL ESTABLECIMIENTO: ', err);
          this.alertaMensajeError('Error', 'Error al cargar los datos del establecimiento.');
        }
      });
  }

  //MÉTODO DE CARGUE DEL FORMULARIO CON DATOS DEL BACKEND (MODOS MODIFICAR Y ELIMINAR):
  chargueForm(): void {
    const e = this.establecimiento;
    this.establecimientoForm = this.formBuilder.group({
      ctextIdEstablecimientoCliente: new FormControl(e.idEstablecimientoCliente || ''),
      cboxIdTipoDocumentoIdentificacionSeleccionado: new FormControl(
        e.tipoDocumentoIdentificacionDTO?.idTipoDocumentoIdentificacion || '', Validators.required
      ),
      ctextNumeroDocumentoIdentificacionEstablecimientoCliente: new FormControl(
        e.numeroDocumentoIdentificacionEstablecimientoCliente || '', Validators.required
      ),
      ctextNombreRazonSocialEstablecimientoCliente: new FormControl(
        e.nombreRazonSocialEstablecimientoCliente || '', Validators.required
      ),
      ctextFechaHMSIngresoEstablecimientoCliente: new FormControl({
        value: this.formatearFechaParaInput(e.fechaHMSIngresoEstablecimientoCliente),
        disabled: true
      }),
      ctextFechaHMSModificacionEstablecimientoCliente: new FormControl({
        value: this.obtenerFechaHoraActual(),
        disabled: true
      }),
      cboxEstadoEstablecimientoCliente: new FormControl(e.estadoEstablecimientoCliente || '', Validators.required)
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

  //MÉTODO DE LOS CRUDS — GUARDAR, MODIFICAR O ELIMINAR REGISTRO:
  accionesGuardarModificarEliminarRegistro(formValues: any): void {
    const fv = this.establecimientoForm.getRawValue();

    //MODO GUARDAR:
    if (this.banderaCrudGuardar) {
      if (this.establecimientoForm.invalid) return;
      const nuevoEstablecimiento: EstablecimientoClienteI = {
        tipoDocumentoIdentificacionDTO: { idTipoDocumentoIdentificacion: Number(fv.cboxIdTipoDocumentoIdentificacionSeleccionado), nombreTipoDocumentoIdentificacion: '' },
        numeroDocumentoIdentificacionEstablecimientoCliente: fv.ctextNumeroDocumentoIdentificacionEstablecimientoCliente,
        nombreRazonSocialEstablecimientoCliente: fv.ctextNombreRazonSocialEstablecimientoCliente,
        fechaHMSIngresoEstablecimientoCliente: fv.ctextFechaHMSIngresoEstablecimientoCliente || this.obtenerFechaHoraActual(),
        fechaHMSModificacionEstablecimientoCliente: '',
        estadoEstablecimientoCliente: fv.cboxEstadoEstablecimientoCliente
      };
      this.establecimientosClientesService.addClientEstablishment(nuevoEstablecimiento).subscribe({
        next: (respuesta) => {
          if (respuesta.mensaje && respuesta.mensaje.toLowerCase().includes('éxito')) {
            //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL CREAR UN ESTABLECIMIENTO CLIENTE (VER AuditoriasSistemaService.registrarAuditoria):
            this.auditoriasSistemaService.registerSystemAudit(
              'CREAR ESTABLECIMIENTO CLIENTE',
              `Se creó el establecimiento cliente ${nuevoEstablecimiento.nombreRazonSocialEstablecimientoCliente}.`
            );
            this.alertaMensajeExito('Confirmación', respuesta.mensaje);
            setTimeout(() => this.closeModal(), 500);
          } else {
            this.alertaMensajeError('Error', respuesta.mensaje || 'Error al guardar el establecimiento.');
          }
        },
        error: (err) => {
          console.error('ERROR AL GUARDAR ESTABLECIMIENTO: ', err);
          this.alertaMensajeError('Error', 'Error al guardar el establecimiento.');
        }
      });
    }

    //MODO MODIFICAR:
    if (this.banderaCrudModificar) {
      if (this.establecimientoForm.invalid) return;
      const establModificado: EstablecimientoClienteI = {
        idEstablecimientoCliente: Number(fv.ctextIdEstablecimientoCliente),
        tipoDocumentoIdentificacionDTO: { idTipoDocumentoIdentificacion: Number(fv.cboxIdTipoDocumentoIdentificacionSeleccionado), nombreTipoDocumentoIdentificacion: '' },
        numeroDocumentoIdentificacionEstablecimientoCliente: fv.ctextNumeroDocumentoIdentificacionEstablecimientoCliente,
        nombreRazonSocialEstablecimientoCliente: fv.ctextNombreRazonSocialEstablecimientoCliente,
        fechaHMSIngresoEstablecimientoCliente: fv.ctextFechaHMSIngresoEstablecimientoCliente || '',
        fechaHMSModificacionEstablecimientoCliente: this.obtenerFechaHoraActual(),
        estadoEstablecimientoCliente: fv.cboxEstadoEstablecimientoCliente
      };
      this.establecimientosClientesService.updateClientEstablishment(establModificado).subscribe({
        next: (respuesta) => {
          if (respuesta.mensaje && respuesta.mensaje.toLowerCase().includes('éxito')) {
            //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL MODIFICAR UN ESTABLECIMIENTO CLIENTE (VER AuditoriasSistemaService.registrarAuditoria):
            this.auditoriasSistemaService.registerSystemAudit(
              'MODIFICAR ESTABLECIMIENTO CLIENTE',
              `Se modificó el establecimiento cliente ${establModificado.nombreRazonSocialEstablecimientoCliente}.`
            );
            this.alertaMensajeExito('Confirmación', respuesta.mensaje);
            setTimeout(() => this.closeModal(), 500);
          } else {
            this.alertaMensajeError('Error', respuesta.mensaje || 'Error al modificar el establecimiento.');
          }
        },
        error: (err) => {
          console.error('ERROR AL MODIFICAR ESTABLECIMIENTO: ', err);
          this.alertaMensajeError('Error', 'Error al modificar el establecimiento.');
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
    const fv = this.establecimientoForm.getRawValue();
    const idEstablecimientoCliente = Number(fv.ctextIdEstablecimientoCliente);
    this.establecimientosClientesService.deleteClientEstablishment(idEstablecimientoCliente).subscribe({
      next: (respuesta) => {
        if (respuesta.mensaje && respuesta.mensaje.toLowerCase().includes('éxito')) {
          //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL ELIMINAR UN ESTABLECIMIENTO CLIENTE (VER AuditoriasSistemaService.registrarAuditoria):
          this.auditoriasSistemaService.registerSystemAudit(
            'ELIMINAR ESTABLECIMIENTO CLIENTE',
            `Se eliminó el establecimiento cliente ${fv.ctextNombreRazonSocialEstablecimientoCliente}.`
          );
          this.alertaMensajeExito('Confirmación', respuesta.mensaje);
          setTimeout(() => this.closeModal(), 500);
        } else {
          this.alertaMensajeError('Error', respuesta.mensaje || 'Error al eliminar el establecimiento.');
        }
      },
      error: (err) => {
        console.error('ERROR AL ELIMINAR ESTABLECIMIENTO: ', err);
        this.alertaMensajeError('Error', 'Error al eliminar el establecimiento.');
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
