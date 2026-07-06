//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

//IMPORTACIÓN DE INTERFACES:
import { PuestoSedeEstablecimientoClienteI } from '../../../../../../interfaces/panel-control/gestion-establecimientos-clientes/sedes-establecimientos-clientes/puestos-sedes-establec-clientes/puestos-sedes-establec-cliente.interface';
import { SedeEstablecimientoClienteI } from '../../../../../../interfaces/panel-control/gestion-establecimientos-clientes/sedes-establecimientos-clientes/sedes-establecimientos-clientes.interface';

//IMPORTACIÓN DE SERVICIOS:
import { PuestosSedesEstablecimientosClientesService } from '../../../../../../services/panel-control/gestion-establecimientos-clientes/sedes-establecimientos-clientes/puestos-sedes-establec-cliente/puestosSedesEstablecimientosClientes.service';
import { AuditoriasSistemaService } from '../../../../../../services/panel-control/auditorias-sistema/auditorias-sistema.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-add-upd-del-puesto-sede-establec-cliente',
  templateUrl: './add-upd-del-puesto-sede-establec-cliente.component.html',
  styleUrls: ['./add-upd-del-puesto-sede-establec-cliente.component.scss']
})
export class AddUpdDelPuestoSedeEstablecClienteComponent implements OnInit, OnChanges {

  //INPUTS: MODO, DATOS DEL PUESTO SELECCIONADO Y SEDE PADRE:
  @Input() modo: string = 'guardar';
  @Input() puestoData: PuestoSedeEstablecimientoClienteI | null = null;
  @Input() sedeData: SedeEstablecimientoClienteI | null = null;

  //OUTPUTS: CERRAR MODAL Y TOAST:
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() toastEvento = new EventEmitter<{ tipo: string; mensaje: string }>();

  //DECLARACIÓN DE VARIABLES GLOBALES:
  puestoForm!: FormGroup;
  puesto!: PuestoSedeEstablecimientoClienteI;
  banderaCrudGuardar: boolean = false;
  banderaCrudModificar: boolean = false;
  banderaCrudEliminar: boolean = false;
  banderaConfirmacionEliminacion: boolean = false;
  private componenteInicializado: boolean = false;

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private puestosSedesEstablecimientosClientesService: PuestosSedesEstablecimientosClientesService,
    private auditoriasSistemaService: AuditoriasSistemaService
  ) {}

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    this.configurarBanderas();
    this.initForm();
    if (this.banderaCrudModificar || this.banderaCrudEliminar) {
      this.cargarDatosPuesto();
    }
    this.componenteInicializado = true;
  }

  //DETECTA CAMBIOS EN LOS @Input Y RECONFIGURA EL FORMULARIO:
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.componenteInicializado) return;
    if (changes['modo'] || changes['puestoData']) {
      this.configurarBanderas();
      this.initForm();
      if (this.banderaCrudModificar || this.banderaCrudEliminar) {
        this.cargarDatosPuesto();
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
    this.puestoForm = this.formBuilder.group({
      ctextIdPuestoSedeEstablecimientoCliente: new FormControl(''),
      ctextNombrePuestoSedeEstablecimientoCliente: new FormControl('', Validators.required),
      ctextDescripcionPuestoSedeEstablecimientoCliente: new FormControl(''),
      ctextFechaHMSIngresoPuestoSedeEstablecimientoCliente: new FormControl({ value: this.obtenerFechaHoraActual(), disabled: true }),
      ctextFechaHMSModificacionPuestoSedeEstablecimientoCliente: new FormControl({ value: '', disabled: true }),
      cboxEstadoPuestoSedeEstablecimientoCliente: new FormControl('ACTIVO', Validators.required)
    });
  }

  //CARGA LOS DATOS DEL PUESTO DESDE EL BACKEND Y LLENA EL FORMULARIO:
  cargarDatosPuesto(): void {
    if (!this.puestoData?.idPuestoSedeEstablecimientoCliente) return;
    this.puestosSedesEstablecimientosClientesService.getClientEstablishmentBranchPostbyId(Number(this.puestoData.idPuestoSedeEstablecimientoCliente))
      .subscribe({
        next: (respuesta) => {
          this.puesto = respuesta.puestoSedeEstablecimientoClienteDTO;
          this.changeDetectorRef.detectChanges();
          this.chargueForm();
        },
        error: (err) => {
          console.error('ERROR AL CARGAR DATOS DEL PUESTO: ', err);
          this.alertaMensajeError('Error', 'Error al cargar los datos del puesto.');
        }
      });
  }

  //MÉTODO DE CARGUE DEL FORMULARIO CON DATOS DEL BACKEND (MODOS MODIFICAR Y ELIMINAR):
  chargueForm(): void {
    const p = this.puesto;
    this.puestoForm.patchValue({
      ctextIdPuestoSedeEstablecimientoCliente: p.idPuestoSedeEstablecimientoCliente || '',
      ctextNombrePuestoSedeEstablecimientoCliente: p.nombrePuestoSedeEstablecimientoCliente || '',
      ctextDescripcionPuestoSedeEstablecimientoCliente: p.descripcionPuestoSedeEstablecimientoCliente || '',
      ctextFechaHMSIngresoPuestoSedeEstablecimientoCliente: this.formatearFechaParaInput(p.fechaHMSIngresoPuestoSedeEstablecimientoCliente),
      ctextFechaHMSModificacionPuestoSedeEstablecimientoCliente: this.obtenerFechaHoraActual(),
      cboxEstadoPuestoSedeEstablecimientoCliente: p.estadoPuestoSedeEstablecimientoCliente || 'ACTIVO'
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

  //CONSTRUYE EL OBJETO PuestoSedeEstablecimientoClienteI DESDE LOS VALORES DEL FORMULARIO:
  private construirPuestoDesdeFormulario(fv: any, esModificacion: boolean): PuestoSedeEstablecimientoClienteI {
    const obj: PuestoSedeEstablecimientoClienteI = {
      nombrePuestoSedeEstablecimientoCliente: fv.ctextNombrePuestoSedeEstablecimientoCliente,
      descripcionPuestoSedeEstablecimientoCliente: fv.ctextDescripcionPuestoSedeEstablecimientoCliente || '',
      fechaHMSIngresoPuestoSedeEstablecimientoCliente: fv.ctextFechaHMSIngresoPuestoSedeEstablecimientoCliente || this.obtenerFechaHoraActual(),
      fechaHMSModificacionPuestoSedeEstablecimientoCliente: esModificacion ? this.obtenerFechaHoraActual() : '',
      estadoPuestoSedeEstablecimientoCliente: fv.cboxEstadoPuestoSedeEstablecimientoCliente,
      sedeEstablecimientoClienteDTO: {
        idSedeEstablecimientoCliente: this.sedeData?.idSedeEstablecimientoCliente,
        nombreSedeEstablecimientoCliente: '',
        direccionSedeEstablecimientoCliente: '',
        telefonoSedeEstablecimientoCliente: '',
        movilSedeEstablecimientoCliente: '',
        correoElectronicoInstitucionalSedeEstablecimientoCliente: '',
        paisOrigenSedeEstablecimientoCliente: '',
        departamentooEstadoOrigenSedeEstablecimientoCliente: '',
        ciudadOrigenSedeEstablecimientoCliente: '',
        fechaHMSIngresoSedeEstablecimientoCliente: '',
        fechaHMSModificacionSedeEstablecimientoCliente: '',
        estadoSedeEstablecimientoCliente: '',
        establecimientoClienteDTO: {
          idEstablecimientoCliente: 0,
          numeroDocumentoIdentificacionEstablecimientoCliente: '',
          nombreRazonSocialEstablecimientoCliente: '',
          fechaHMSIngresoEstablecimientoCliente: '',
          fechaHMSModificacionEstablecimientoCliente: '',
          estadoEstablecimientoCliente: '',
          tipoDocumentoIdentificacionDTO: { idTipoDocumentoIdentificacion: 0, nombreTipoDocumentoIdentificacion: '' }
        }
      }
    };
    if (esModificacion) {
      obj.idPuestoSedeEstablecimientoCliente = Number(fv.ctextIdPuestoSedeEstablecimientoCliente);
    }
    return obj;
  }

  //MÉTODO DE LOS CRUDS — GUARDAR, MODIFICAR O ELIMINAR REGISTRO:
  accionesGuardarModificarEliminarRegistro(formValues: any): void {
    const fv = this.puestoForm.getRawValue();

    //MODO GUARDAR:
    if (this.banderaCrudGuardar) {
      if (this.puestoForm.invalid) return;
      const nuevoPuesto = this.construirPuestoDesdeFormulario(fv, false);
      this.puestosSedesEstablecimientosClientesService.addClientEstablishmentBranchPost(nuevoPuesto).subscribe({
        next: (respuesta) => {
          if (respuesta.mensaje && respuesta.mensaje.toLowerCase().includes('éxito')) {
            //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL CREAR UN PUESTO DE TRABAJO (VER AuditoriasSistemaService.registrarAuditoria):
            this.auditoriasSistemaService.registerSystemAudit('CREAR PUESTO', `Se creó el puesto de trabajo ${nuevoPuesto.nombrePuestoSedeEstablecimientoCliente}.`);
            this.alertaMensajeExito('Confirmación', respuesta.mensaje);
            setTimeout(() => this.closeModal(), 500);
          } else {
            this.alertaMensajeError('Error', respuesta.mensaje || 'Error al guardar el puesto.');
          }
        },
        error: (err) => {
          console.error('ERROR AL GUARDAR PUESTO: ', err);
          this.alertaMensajeError('Error', 'Error al guardar el puesto.');
        }
      });
    }

    //MODO MODIFICAR:
    if (this.banderaCrudModificar) {
      if (this.puestoForm.invalid) return;
      const puestoModificado = this.construirPuestoDesdeFormulario(fv, true);
      this.puestosSedesEstablecimientosClientesService.updateClientEstablishmentBranchPost(puestoModificado).subscribe({
        next: (respuesta) => {
          if (respuesta.mensaje && respuesta.mensaje.toLowerCase().includes('éxito')) {
            //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL MODIFICAR UN PUESTO DE TRABAJO (VER AuditoriasSistemaService.registrarAuditoria):
            this.auditoriasSistemaService.registerSystemAudit('MODIFICAR PUESTO', `Se modificó el puesto de trabajo ${puestoModificado.nombrePuestoSedeEstablecimientoCliente}.`);
            this.alertaMensajeExito('Confirmación', respuesta.mensaje);
            setTimeout(() => this.closeModal(), 500);
          } else {
            this.alertaMensajeError('Error', respuesta.mensaje || 'Error al modificar el puesto.');
          }
        },
        error: (err) => {
          console.error('ERROR AL MODIFICAR PUESTO: ', err);
          this.alertaMensajeError('Error', 'Error al modificar el puesto.');
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
    const fv = this.puestoForm.getRawValue();
    const idPuestoSedeEstablecimientoCliente = Number(fv.ctextIdPuestoSedeEstablecimientoCliente);
    this.puestosSedesEstablecimientosClientesService.deleteClientEstablishmentBranchPost(idPuestoSedeEstablecimientoCliente).subscribe({
      next: (respuesta) => {
        if (respuesta.mensaje && respuesta.mensaje.toLowerCase().includes('éxito')) {
          //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL ELIMINAR UN PUESTO DE TRABAJO (VER AuditoriasSistemaService.registrarAuditoria):
          this.auditoriasSistemaService.registerSystemAudit('ELIMINAR PUESTO', `Se eliminó el puesto de trabajo ${fv.ctextNombrePuestoSedeEstablecimientoCliente}.`);
          this.alertaMensajeExito('Confirmación', respuesta.mensaje);
          setTimeout(() => this.closeModal(), 500);
        } else {
          this.alertaMensajeError('Error', respuesta.mensaje || 'Error al eliminar el puesto.');
        }
      },
      error: (err) => {
        console.error('ERROR AL ELIMINAR PUESTO: ', err);
        this.alertaMensajeError('Error', 'Error al eliminar el puesto.');
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
