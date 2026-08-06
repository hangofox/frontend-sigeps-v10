//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

//IMPORTACIÓN DE INTERFACES:
import { TarifasEmpleadosI } from '../../../../interfaces/panel-control/tarifas-empleados/tarifas-empleados.interface';
import { TiposTarifasEmpleadosI } from '../../../../interfaces/panel-control/tipos-tarifas-empleados/tipos-tarifas-empleados.interface';
import { TipoEmpleadoI } from '../../../../interfaces/tipos-empleados/tipos-empleados.interface';
import { TipoEmpleadoPlantaI } from '../../../../interfaces/tipos-empleados-planta/tipos-empleados-planta.interface';
import { ClasificacionEmpleadoPlantaI } from '../../../../interfaces/clasificaciones-empleados-planta/clasificaciones-empleados-planta.interface';
import { SubclasificacionEmpleadoPlantaI } from '../../../../interfaces/clasificaciones-empleados-planta/subclasificaciones-empleados-planta/subclasificaciones-empleados-planta.interface';

//IMPORTACIÓN DE SERVICIOS:
import { TarifasEmpleadosService } from '../../../../services/panel-control/tarifas-empleados/tarifas-empleados.service';
import { TiposTarifasEmpleadosService } from '../../../../services/panel-control/tipos-tarifas-empleados/tipos-tarifas-empleados.service';
import { TiposEmpleadosService } from '../../../../services/tipos-empleados/tiposEmpleados.service';
import { TiposEmpleadosPlantaService } from '../../../../services/tipos-empleados-planta/tiposEmpleadosPlanta.service';
import { ClasificacionesEmpleadosPlantaService } from '../../../../services/clasificaciones-empleados-planta/clasificacionesEmpleadosPlanta.service';
import { SubclasificacionesEmpleadosPlantaService } from '../../../../services/clasificaciones-empleados-planta/subclasificaciones-empleados-planta/subclasificacionesEmpleadosPlanta.service';
import { AuditoriasSistemaService } from '../../../../services/panel-control/auditorias-sistema/auditorias-sistema.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-add-upd-del-tarifa-empleado',
  templateUrl: './add-upd-del-tarifa-empleado.component.html',
  styleUrls: ['./add-upd-del-tarifa-empleado.component.scss']
})
export class AddUpdDelTarifaEmpleadoComponent implements OnInit, OnChanges {

  //INPUTS: MODO Y DATOS DE LA TARIFA DE EMPLEADO SELECCIONADA:
  @Input() modo: string = 'guardar';
  @Input() tarifaEmpleadoData: TarifasEmpleadosI | null = null;

  //OUTPUTS: CERRAR MODAL Y TOAST:
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() toastEvento = new EventEmitter<{ tipo: string; mensaje: string }>();

  //DECLARACIÓN DE VARIABLES GLOBALES:
  tarifaEmpleadoForm!: FormGroup;
  tarifaEmpleado!: TarifasEmpleadosI;
  banderaCrudGuardar: boolean = false;
  banderaCrudModificar: boolean = false;
  banderaCrudEliminar: boolean = false;
  banderaConfirmacionEliminacion: boolean = false;
  private componenteInicializado: boolean = false;

  //LISTAS CARGADAS DESDE EL BACKEND:
  tiposEmpleados: TipoEmpleadoI[] = [];
  tiposTarifasEmpleados: TiposTarifasEmpleadosI[] = [];

  //CATÁLOGOS COMPLETOS (SIN FILTRAR) DE LOS 3 NIVELES QUE PARTICIPAN EN LA CASCADA:
  private tiposEmpleadosPlantaCompleto: TipoEmpleadoPlantaI[] = [];
  private clasificacionesEmpleadosPlantaCompleto: ClasificacionEmpleadoPlantaI[] = [];
  private subclasificacionesEmpleadosPlantaCompleto: SubclasificacionEmpleadoPlantaI[] = [];

  //OPCIONES YA FILTRADAS EN CASCADA QUE SE MUESTRAN EN CADA COMBO (TIPO EMPLEADO → TIPO PLANTA → CLASIFICACIÓN → SUBCLASIFICACIÓN):
  tiposEmpleadosPlanta: TipoEmpleadoPlantaI[] = [];
  clasificacionesEmpleadosPlanta: ClasificacionEmpleadoPlantaI[] = [];
  subclasificacionesEmpleadosPlanta: SubclasificacionEmpleadoPlantaI[] = [];

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private tarifasEmpleadosService: TarifasEmpleadosService,
    private tiposTarifasEmpleadosService: TiposTarifasEmpleadosService,
    private tiposEmpleadosService: TiposEmpleadosService,
    private tiposEmpleadosPlantaService: TiposEmpleadosPlantaService,
    private clasificacionesEmpleadosPlantaService: ClasificacionesEmpleadosPlantaService,
    private subclasificacionesEmpleadosPlantaService: SubclasificacionesEmpleadosPlantaService,
    private auditoriasSistemaService: AuditoriasSistemaService
  ) {}

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    this.configurarBanderas();
    this.initForm();
    this.cargarCombos();
    if (this.banderaCrudModificar || this.banderaCrudEliminar) {
      this.cargarDatosTarifaEmpleado();
    }
    this.componenteInicializado = true;
  }

  //DETECTA CAMBIOS EN LOS @Input Y RECONFIGURA EL FORMULARIO:
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.componenteInicializado) return;
    if (changes['modo'] || changes['tarifaEmpleadoData']) {
      this.configurarBanderas();
      this.initForm();
      if (this.banderaCrudModificar || this.banderaCrudEliminar) {
        this.cargarDatosTarifaEmpleado();
      }
    }
  }

  //CONFIGURA LAS BANDERAS CRUD SEGÚN EL MODO RECIBIDO:
  configurarBanderas(): void {
    this.banderaCrudGuardar = this.modo === 'guardar';
    this.banderaCrudModificar = this.modo === 'modificar';
    this.banderaCrudEliminar = this.modo === 'eliminar';
  }

  //CARGA LOS COMBOS DE TIPO DE EMPLEADO, TIPO DE EMPLEADO PLANTA, CLASIFICACIÓN, SUBCLASIFICACIÓN Y TIPO DE TARIFA DESDE EL BACKEND:
  cargarCombos(): void {
    this.tiposEmpleadosService.findAllTypesOfEmployees(undefined, undefined, 'nombreTipoEmpleado', 'ASC')
      .subscribe({
        next: (data) => { this.tiposEmpleados = data; },
        error: (err) => console.error('ERROR COMBO TIPO EMPLEADO: ', err)
      });

    this.tiposEmpleadosPlantaService.findAllTypesOfStaffEmployees(undefined, undefined, 'idTipoEmpleadoPlanta', 'ASC')
      .subscribe({
        next: (data) => {
          this.tiposEmpleadosPlantaCompleto = data;
          this.actualizarOpcionesTipoEmpleadoPlanta();
        },
        error: (err) => console.error('ERROR COMBO TIPO EMPLEADO PLANTA: ', err)
      });

    this.clasificacionesEmpleadosPlantaService.findAllClassificationsOfStaffEmployees(undefined, undefined, 'nombreClasificacionEmpleadoPlanta', 'ASC')
      .subscribe({
        next: (data) => {
          this.clasificacionesEmpleadosPlantaCompleto = data;
          this.actualizarOpcionesClasificacion();
        },
        error: (err) => console.error('ERROR COMBO CLASIFICACIÓN: ', err)
      });

    this.subclasificacionesEmpleadosPlantaService.findAllSubclassificationsOfStaffEmployees(undefined, undefined, 'nombreSubclasificacionEmpleadoPlanta', 'ASC')
      .subscribe({
        next: (data) => {
          this.subclasificacionesEmpleadosPlantaCompleto = data;
          this.actualizarOpcionesSubclasificacion();
        },
        error: (err) => console.error('ERROR COMBO SUBCLASIFICACIÓN: ', err)
      });

    this.tiposTarifasEmpleadosService.findAllEmployeeRateTypes(undefined, undefined, undefined, 'nombreTipoTarifaEmpleado', 'ASC')
      .subscribe({
        next: (data) => { this.tiposTarifasEmpleados = data; },
        error: (err) => console.error('ERROR AL CARGAR TIPOS DE TARIFA DE EMPLEADO: ', err)
      });
  }

  //REGLA DE NEGOCIO SEGÚN EL TIPO DE EMPLEADO: "PLANTA" MUESTRA LAS 3 OPCIONES DE TIPO DE EMPLEADO PLANTA;
  //"DISPONIBLE" O "RELEVANTE" SOLO PERMITEN "NO APLICA" Y SE AUTOSELECCIONA EN CASCADA HASTA SUBCLASIFICACIÓN:
  actualizarOpcionesTipoEmpleadoPlanta(): void {
    this.tiposEmpleadosPlanta = this.tiposEmpleadosPlantaCompleto.filter(t => ['ADMINISTRATIVO', 'OPERATIVO', 'NO APLICA'].includes(String(t.nombreTipoEmpleadoPlanta).toUpperCase()));
  }

  //RESTRINGE UNA LISTA YA FILTRADA AL ELEMENTO CUYO NOMBRE SEA EXACTAMENTE "NO APLICA" (SI EXISTE):
  private restringirANoAplica<T extends { }>(lista: T[], obtenerNombre: (item: T) => any): T[] {
    const item = lista.find(i => String(obtenerNombre(i)).toUpperCase() === 'NO APLICA');
    return item ? [item] : lista;
  }

  //AL CAMBIAR EL TIPO DE EMPLEADO: APLICA LA REGLA DE NEGOCIO Y RECALCULA TODA LA CASCADA HACIA ABAJO:
  cambiarTipoEmpleado(): void {
    const idTipoEmpleado = this.tarifaEmpleadoForm.value.cboxIdTipoEmpleado;
    const tipoEmpleadoSeleccionado = this.tiposEmpleados.find(t => t.idTipoEmpleado === Number(idTipoEmpleado));
    const nombreTipoEmpleado = String(tipoEmpleadoSeleccionado?.nombreTipoEmpleado || '').toUpperCase();

    this.tarifaEmpleadoForm.patchValue({ cboxIdTipoEmpleadoPlanta: '', cboxIdClasificacionEmpleadoPlanta: '', cboxIdSubclasificacionEmpleadoPlanta: '' }, { emitEvent: false });

    if (nombreTipoEmpleado === 'DISPONIBLE' || nombreTipoEmpleado === 'RELEVANTE') {
      //SOLO "NO APLICA" ES VÁLIDO, Y SE AUTOSELECCIONA EN CASCADA HASTA SUBCLASIFICACIÓN:
      this.tiposEmpleadosPlanta = this.restringirANoAplica(this.tiposEmpleadosPlantaCompleto, t => t.nombreTipoEmpleadoPlanta);
      this.tarifaEmpleadoForm.patchValue({ cboxIdTipoEmpleadoPlanta: this.tiposEmpleadosPlanta[0]?.idTipoEmpleadoPlanta || '' }, { emitEvent: false });

      this.actualizarOpcionesClasificacion();
      this.clasificacionesEmpleadosPlanta = this.restringirANoAplica(this.clasificacionesEmpleadosPlanta, c => c.nombreClasificacionEmpleadoPlanta);
      this.tarifaEmpleadoForm.patchValue({ cboxIdClasificacionEmpleadoPlanta: this.clasificacionesEmpleadosPlanta[0]?.idClasificacionEmpleadoPlanta || '' }, { emitEvent: false });

      this.actualizarOpcionesSubclasificacion();
      this.subclasificacionesEmpleadosPlanta = this.restringirANoAplica(this.subclasificacionesEmpleadosPlanta, s => s.nombreSubclasificacionEmpleadoPlanta);
      this.tarifaEmpleadoForm.patchValue({ cboxIdSubclasificacionEmpleadoPlanta: this.subclasificacionesEmpleadosPlanta[0]?.idSubclasificacionEmpleadoPlanta || '' }, { emitEvent: false });
    } else if (nombreTipoEmpleado === 'PLANTA') {
      //LAS 3 OPCIONES QUEDAN DISPONIBLES PARA QUE EL USUARIO ELIJA MANUALMENTE:
      this.actualizarOpcionesTipoEmpleadoPlanta();
      this.clasificacionesEmpleadosPlanta = [];
      this.subclasificacionesEmpleadosPlanta = [];
    } else {
      //NINGÚN TIPO DE EMPLEADO VÁLIDO SELECCIONADO TODAVÍA:
      this.tiposEmpleadosPlanta = [];
      this.clasificacionesEmpleadosPlanta = [];
      this.subclasificacionesEmpleadosPlanta = [];
    }
  }

  //FILTRA LA CLASIFICACIÓN POR EL TIPO DE EMPLEADO PLANTA SELECCIONADO (RELACIÓN PADRE-HIJO REAL DEL BACKEND):
  actualizarOpcionesClasificacion(): void {
    const idTipoEmpleadoPlanta = this.tarifaEmpleadoForm?.value.cboxIdTipoEmpleadoPlanta;
    this.clasificacionesEmpleadosPlanta = idTipoEmpleadoPlanta
      ? this.clasificacionesEmpleadosPlantaCompleto.filter(c => c.tipoEmpleadoPlantaDTO?.idTipoEmpleadoPlanta === Number(idTipoEmpleadoPlanta))
      : [];
  }

  //FILTRA LA SUBCLASIFICACIÓN POR LA CLASIFICACIÓN SELECCIONADA (RELACIÓN PADRE-HIJO REAL DEL BACKEND):
  actualizarOpcionesSubclasificacion(): void {
    const idClasificacion = this.tarifaEmpleadoForm?.value.cboxIdClasificacionEmpleadoPlanta;
    this.subclasificacionesEmpleadosPlanta = idClasificacion
      ? this.subclasificacionesEmpleadosPlantaCompleto.filter(s => s.clasificacionEmpleadoPlantaDTO?.idClasificacionEmpleadoPlanta === Number(idClasificacion))
      : [];
  }

  //AL CAMBIAR EL TIPO DE EMPLEADO PLANTA: LIMPIA CLASIFICACIÓN Y SUBCLASIFICACIÓN Y RECALCULA LA CASCADA:
  cambiarTipoEmpleadoPlanta(): void {
    this.tarifaEmpleadoForm.patchValue({ cboxIdClasificacionEmpleadoPlanta: '', cboxIdSubclasificacionEmpleadoPlanta: '' }, { emitEvent: false });
    this.actualizarOpcionesClasificacion();
    this.actualizarOpcionesSubclasificacion();
  }

  //AL CAMBIAR LA CLASIFICACIÓN: LIMPIA LA SUBCLASIFICACIÓN Y RECALCULA LA CASCADA:
  cambiarClasificacion(): void {
    this.tarifaEmpleadoForm.patchValue({ cboxIdSubclasificacionEmpleadoPlanta: '' }, { emitEvent: false });
    this.actualizarOpcionesSubclasificacion();
  }

  //MÉTODO DE INICIALIZACIÓN DEL FORMULARIO (VACÍO — MODO GUARDAR):
  initForm(): void {
    this.tarifaEmpleadoForm = this.formBuilder.group({
      ctextIdTarifaEmpleado: new FormControl(''),
      cboxIdTipoEmpleado: new FormControl('', Validators.required),
      cboxIdTipoEmpleadoPlanta: new FormControl('', Validators.required),
      cboxIdClasificacionEmpleadoPlanta: new FormControl('', Validators.required),
      cboxIdSubclasificacionEmpleadoPlanta: new FormControl('', Validators.required),
      cboxTipoTarifaEmpleadoSeleccionado: new FormControl('', Validators.required),
      ctextAnioTarifaEmpleado: new FormControl('', Validators.required),
      ctextValorHoraTarifaEmpleado: new FormControl('', Validators.required),
      ctextFechaHMSIngresoTarifaEmpleado: new FormControl({ value: this.obtenerFechaHoraActual(), disabled: true }),
      ctextFechaHMSModificacionTarifaEmpleado: new FormControl({ value: '', disabled: true }),
      cboxEstadoTarifaEmpleado: new FormControl('ACTIVO', Validators.required)
    });
  }

  //CARGA LOS DATOS DE LA TARIFA DE EMPLEADO DESDE EL BACKEND Y LLENA EL FORMULARIO:
  cargarDatosTarifaEmpleado(): void {
    if (!this.tarifaEmpleadoData?.idTarifaEmpleado) return;
    this.tarifasEmpleadosService.getEmployeeRatebyId(Number(this.tarifaEmpleadoData.idTarifaEmpleado))
      .subscribe({
        next: (respuesta) => {
          this.tarifaEmpleado = respuesta.tarifaEmpleadoDTO;
          this.changeDetectorRef.detectChanges();
          this.chargueForm();
        },
        error: (err) => {
          console.error('ERROR AL CARGAR DATOS DE LA TARIFA DE EMPLEADO: ', err);
          this.alertaMensajeError('Error', 'Error al cargar los datos de la tarifa de empleado.');
        }
      });
  }

  //MÉTODO DE CARGUE DEL FORMULARIO CON DATOS DEL BACKEND (MODOS MODIFICAR Y ELIMINAR):
  chargueForm(): void {
    const t = this.tarifaEmpleado;

    //RECALCULA LA CASCADA DE COMBOS SEGÚN LOS DATOS YA GUARDADOS DE LA TARIFA, ANTES DE APLICAR LOS VALORES AL FORMULARIO:
    const nombreTipoEmpleado = String(t.tipoEmpleadoDTO?.nombreTipoEmpleado || '').toUpperCase();

    if (nombreTipoEmpleado === 'DISPONIBLE' || nombreTipoEmpleado === 'RELEVANTE') {
      this.tiposEmpleadosPlanta = this.restringirANoAplica(this.tiposEmpleadosPlantaCompleto, tp => tp.nombreTipoEmpleadoPlanta);
      this.clasificacionesEmpleadosPlanta = this.restringirANoAplica(
        this.clasificacionesEmpleadosPlantaCompleto.filter(c => c.tipoEmpleadoPlantaDTO?.idTipoEmpleadoPlanta === t.tipoEmpleadoPlantaDTO?.idTipoEmpleadoPlanta),
        c => c.nombreClasificacionEmpleadoPlanta
      );
      this.subclasificacionesEmpleadosPlanta = this.restringirANoAplica(
        this.subclasificacionesEmpleadosPlantaCompleto.filter(s => s.clasificacionEmpleadoPlantaDTO?.idClasificacionEmpleadoPlanta === t.clasificacionEmpleadoPlantaDTO?.idClasificacionEmpleadoPlanta),
        s => s.nombreSubclasificacionEmpleadoPlanta
      );
    } else {
      this.actualizarOpcionesTipoEmpleadoPlanta();
      this.clasificacionesEmpleadosPlanta = t.tipoEmpleadoPlantaDTO?.idTipoEmpleadoPlanta
        ? this.clasificacionesEmpleadosPlantaCompleto.filter(c => c.tipoEmpleadoPlantaDTO?.idTipoEmpleadoPlanta === t.tipoEmpleadoPlantaDTO.idTipoEmpleadoPlanta)
        : [];
      this.subclasificacionesEmpleadosPlanta = t.clasificacionEmpleadoPlantaDTO?.idClasificacionEmpleadoPlanta
        ? this.subclasificacionesEmpleadosPlantaCompleto.filter(s => s.clasificacionEmpleadoPlantaDTO?.idClasificacionEmpleadoPlanta === t.clasificacionEmpleadoPlantaDTO.idClasificacionEmpleadoPlanta)
        : [];
    }

    this.tarifaEmpleadoForm.patchValue({
      ctextIdTarifaEmpleado: t.idTarifaEmpleado || '',
      cboxIdTipoEmpleado: t.tipoEmpleadoDTO?.idTipoEmpleado || '',
      cboxIdTipoEmpleadoPlanta: t.tipoEmpleadoPlantaDTO?.idTipoEmpleadoPlanta || '',
      cboxIdClasificacionEmpleadoPlanta: t.clasificacionEmpleadoPlantaDTO?.idClasificacionEmpleadoPlanta || '',
      cboxIdSubclasificacionEmpleadoPlanta: t.subclasificacionEmpleadoPlantaDTO?.idSubclasificacionEmpleadoPlanta || '',
      cboxTipoTarifaEmpleadoSeleccionado: t.tipoTarifaEmpleadoDTO?.idTipoTarifaEmpleado || '',
      ctextAnioTarifaEmpleado: t.anioTarifaEmpleado || '',
      ctextValorHoraTarifaEmpleado: t.valorHoraTarifaEmpleado || '',
      ctextFechaHMSIngresoTarifaEmpleado: this.formatearFechaParaInput(t.fechaHMSIngresoTarifaEmpleado),
      ctextFechaHMSModificacionTarifaEmpleado: this.obtenerFechaHoraActual(),
      cboxEstadoTarifaEmpleado: t.estadoTarifaEmpleado || 'ACTIVO'
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

  //CONSTRUYE EL OBJETO DE LA TARIFA DE EMPLEADO DESDE LOS VALORES DEL FORMULARIO (SE TIPA COMO any PORQUE EL
  //BACKEND SOLO NECESITA EL id DE LOS DTO ANIDADOS PARA RESOLVER LAS RELACIONES, NO EL OBJETO COMPLETO):
  private construirTarifaEmpleadoDesdeFormulario(fv: any, esModificacion: boolean): any {
    const obj: any = {
      anioTarifaEmpleado: Number(fv.ctextAnioTarifaEmpleado),
      valorHoraTarifaEmpleado: Number(fv.ctextValorHoraTarifaEmpleado),
      fechaHMSIngresoTarifaEmpleado: fv.ctextFechaHMSIngresoTarifaEmpleado || this.obtenerFechaHoraActual(),
      fechaHMSModificacionTarifaEmpleado: esModificacion ? this.obtenerFechaHoraActual() : '',
      estadoTarifaEmpleado: fv.cboxEstadoTarifaEmpleado,
      tipoEmpleadoDTO: { idTipoEmpleado: Number(fv.cboxIdTipoEmpleado) },
      tipoEmpleadoPlantaDTO: { idTipoEmpleadoPlanta: Number(fv.cboxIdTipoEmpleadoPlanta) },
      clasificacionEmpleadoPlantaDTO: { idClasificacionEmpleadoPlanta: Number(fv.cboxIdClasificacionEmpleadoPlanta) },
      subclasificacionEmpleadoPlantaDTO: { idSubclasificacionEmpleadoPlanta: Number(fv.cboxIdSubclasificacionEmpleadoPlanta) },
      tipoTarifaEmpleadoDTO: { idTipoTarifaEmpleado: Number(fv.cboxTipoTarifaEmpleadoSeleccionado) }
    };
    if (esModificacion) {
      obj.idTarifaEmpleado = Number(fv.ctextIdTarifaEmpleado);
    }
    return obj;
  }

  //MÉTODO DE LOS CRUDS — GUARDAR, MODIFICAR O ELIMINAR REGISTRO:
  accionesGuardarModificarEliminarRegistro(formValues: any): void {
    const fv = this.tarifaEmpleadoForm.getRawValue();

    //MODO GUARDAR:
    if (this.banderaCrudGuardar) {
      if (this.tarifaEmpleadoForm.invalid) return;
      const nuevaTarifaEmpleado = this.construirTarifaEmpleadoDesdeFormulario(fv, false);
      this.tarifasEmpleadosService.addEmployeeRate(nuevaTarifaEmpleado).subscribe({
        next: (respuesta) => {
          if (respuesta.mensaje && respuesta.mensaje.toLowerCase().includes('éxito')) {
            //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL CREAR UNA TARIFA DE EMPLEADO (VER AuditoriasSistemaService.registrarAuditoria):
            this.auditoriasSistemaService.registerSystemAudit('CREAR TARIFA DE EMPLEADO', `Se creó la tarifa de empleado del año ${nuevaTarifaEmpleado.anioTarifaEmpleado}.`);
            this.alertaMensajeExito('Confirmación', respuesta.mensaje);
            setTimeout(() => this.closeModal(), 500);
          } else {
            this.alertaMensajeError('Error', respuesta.mensaje || 'Error al guardar la tarifa de empleado.');
          }
        },
        error: (err) => {
          console.error('ERROR AL GUARDAR TARIFA DE EMPLEADO: ', err);
          this.alertaMensajeError('Error', 'Error al guardar la tarifa de empleado.');
        }
      });
    }

    //MODO MODIFICAR:
    if (this.banderaCrudModificar) {
      if (this.tarifaEmpleadoForm.invalid) return;
      const tarifaEmpleadoModificada = this.construirTarifaEmpleadoDesdeFormulario(fv, true);
      this.tarifasEmpleadosService.updateEmployeeRate(tarifaEmpleadoModificada).subscribe({
        next: (respuesta) => {
          if (respuesta.mensaje && respuesta.mensaje.toLowerCase().includes('éxito')) {
            //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL MODIFICAR UNA TARIFA DE EMPLEADO (VER AuditoriasSistemaService.registrarAuditoria):
            this.auditoriasSistemaService.registerSystemAudit('MODIFICAR TARIFA DE EMPLEADO', `Se modificó la tarifa de empleado del año ${tarifaEmpleadoModificada.anioTarifaEmpleado}.`);
            this.alertaMensajeExito('Confirmación', respuesta.mensaje);
            setTimeout(() => this.closeModal(), 500);
          } else {
            this.alertaMensajeError('Error', respuesta.mensaje || 'Error al modificar la tarifa de empleado.');
          }
        },
        error: (err) => {
          console.error('ERROR AL MODIFICAR TARIFA DE EMPLEADO: ', err);
          this.alertaMensajeError('Error', 'Error al modificar la tarifa de empleado.');
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
    const fv = this.tarifaEmpleadoForm.getRawValue();
    const idTarifaEmpleado = Number(fv.ctextIdTarifaEmpleado);
    this.tarifasEmpleadosService.deleteEmployeeRate(idTarifaEmpleado).subscribe({
      next: (respuesta) => {
        if (respuesta.mensaje && respuesta.mensaje.toLowerCase().includes('éxito')) {
          //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL ELIMINAR UNA TARIFA DE EMPLEADO (VER AuditoriasSistemaService.registrarAuditoria):
          this.auditoriasSistemaService.registerSystemAudit('ELIMINAR TARIFA DE EMPLEADO', `Se eliminó la tarifa de empleado del año ${fv.ctextAnioTarifaEmpleado}.`);
          this.alertaMensajeExito('Confirmación', respuesta.mensaje);
          setTimeout(() => this.closeModal(), 500);
        } else {
          this.alertaMensajeError('Error', respuesta.mensaje || 'Error al eliminar la tarifa de empleado.');
        }
      },
      error: (err) => {
        console.error('ERROR AL ELIMINAR TARIFA DE EMPLEADO: ', err);
        this.alertaMensajeError('Error', 'Error al eliminar la tarifa de empleado.');
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
