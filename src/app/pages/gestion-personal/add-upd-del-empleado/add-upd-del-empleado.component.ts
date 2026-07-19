//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

//IMPORTACIÓN DE INTERFACES:
import { EmpleadosI } from '../../../interfaces/gestion-personal/empleados/empleados.interface';
import { ResponseEmpleadoDTO } from '../../../interfaces/gestion-personal/empleados/responseEmpleadoDTO.interface';
import { TiposDocumentosIdentificacionI } from '../../../interfaces/tipos-documentos-identificacion/tipos-documentos-identificacion.interface';
import { TipoEmpleadoI } from '../../../interfaces/gestion-personal/tipos-empleados/tipos-empleados.interface';
import { TipoEmpleadoPlantaI } from '../../../interfaces/gestion-personal/tipos-empleados-planta/tipos-empleados-planta.interface';
import { ClasificacionEmpleadoPlantaI } from '../../../interfaces/gestion-personal/clasificaciones-empleados-planta/clasificaciones-empleados-planta.interface';
import { SubclasificacionEmpleadoPlantaI } from '../../../interfaces/gestion-personal/clasificaciones-empleados-planta/subclasificaciones-empleados-planta/subclasificaciones-empleados-planta.interface';
import { ParametrosSistemaI } from '../../../interfaces/panel-control/parametros-sistema/parametros-sistema.interface';

//IMPORTACIÓN DE SERVICIOS:
import { EmpleadosService } from '../../../services/gestion-personal/empleados/empleados.service';
import { TiposDocumentosIdentificacionService } from '../../../services/tipos-documentos-identificacion/tipos-documentos-identificacion.service';
import { TiposEmpleadosService } from '../../../services/gestion-personal/tipos-empleados/tiposEmpleados.service';
import { TiposEmpleadosPlantaService } from '../../../services/gestion-personal/tipos-empleados-planta/tiposEmpleadosPlanta.service';
import { ClasificacionesEmpleadosPlantaService } from '../../../services/gestion-personal/clasificaciones-empleados-planta/clasificacionesEmpleadosPlanta.service';
import { SubclasificacionesEmpleadosPlantaService } from '../../../services/gestion-personal/clasificaciones-empleados-planta/subclasificaciones-empleados-planta/subclasificacionesEmpleadosPlanta.service';
import { AuditoriasSistemaService } from '../../../services/panel-control/auditorias-sistema/auditorias-sistema.service';
import { ParametrosSistemaService } from '../../../services/panel-control/parametros-sistema/parametros-sistema.service';
import { GestionArchivosService } from '../../../services/gestion-archivos/gestion-archivos.service';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-add-upd-del-empleado',
  templateUrl: './add-upd-del-empleado.component.html',
  styleUrls: ['./add-upd-del-empleado.component.scss']
})
export class AddUpdDelEmpleadoComponent implements OnInit, OnChanges {

  //INPUTS: MODO Y DATOS DEL EMPLEADO SELECCIONADO:
  @Input() modo: string = 'guardar';
  @Input() empleadoData: EmpleadosI | null = null;

  //OUTPUTS: CERRAR MODAL Y TOAST:
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() toastEvento = new EventEmitter<{ tipo: string; mensaje: string }>();

  //DECLARACIÓN DE VARIABLES GLOBALES:
  empleadoForm!: FormGroup;
  empleado!: EmpleadosI;
  banderaCrudGuardar: boolean = false;
  banderaCrudModificar: boolean = false;
  banderaCrudEliminar: boolean = false;
  banderaConfirmacionEliminacion: boolean = false;
  banderaConfirmacionEliminacionFoto: boolean = false;
  private componenteInicializado: boolean = false;

  //FOTO DEL EMPLEADO:
  selectedFileUserPhoto: File | null = null;
  isSelectedFileUserPhoto: boolean = false;
  previewUrlFotoEmpleado: string | null = null;

  //LISTAS CARGADAS DESDE EL BACKEND:
  tiposDocumentosIdentificacion: TiposDocumentosIdentificacionI[] = [];
  tiposEmpleados: TipoEmpleadoI[] = [];

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
    private empleadosService: EmpleadosService,
    private tiposDocumentosIdentificacionService: TiposDocumentosIdentificacionService,
    private tiposEmpleadosService: TiposEmpleadosService,
    private tiposEmpleadosPlantaService: TiposEmpleadosPlantaService,
    private clasificacionesEmpleadosPlantaService: ClasificacionesEmpleadosPlantaService,
    private subclasificacionesEmpleadosPlantaService: SubclasificacionesEmpleadosPlantaService,
    private auditoriasSistemaService: AuditoriasSistemaService,
    private parametrosSistemaService: ParametrosSistemaService,
    private gestionArchivosService: GestionArchivosService
  ) {}

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    this.configurarBanderas();
    this.initForm();
    this.cargarCombos();
    if (this.banderaCrudModificar || this.banderaCrudEliminar) {
      this.cargarDatosEmpleado();
    }
    this.componenteInicializado = true;
  }

  //DETECTA CAMBIOS EN LOS @Input Y RECONFIGURA EL FORMULARIO:
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.componenteInicializado) return;
    if (changes['modo'] || changes['empleadoData']) {
      this.configurarBanderas();
      this.initForm();
      if (this.banderaCrudModificar || this.banderaCrudEliminar) {
        this.cargarDatosEmpleado();
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
        next: (data) => { this.tiposDocumentosIdentificacion = data; },
        error: (err) => console.error('ERROR COMBO TIPO DOC: ', err)
      });

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
    const idTipoEmpleado = this.empleadoForm.value.cboxIdTipoEmpleado;
    const tipoEmpleadoSeleccionado = this.tiposEmpleados.find(t => t.idTipoEmpleado === Number(idTipoEmpleado));
    const nombreTipoEmpleado = String(tipoEmpleadoSeleccionado?.nombreTipoEmpleado || '').toUpperCase();

    this.empleadoForm.patchValue({ cboxIdTipoEmpleadoPlanta: '', cboxIdClasificacionEmpleadoPlanta: '', cboxIdSubclasificacionEmpleadoPlanta: '' }, { emitEvent: false });

    if (nombreTipoEmpleado === 'DISPONIBLE' || nombreTipoEmpleado === 'RELEVANTE') {
      //SOLO "NO APLICA" ES VÁLIDO, Y SE AUTOSELECCIONA EN CASCADA HASTA SUBCLASIFICACIÓN:
      this.tiposEmpleadosPlanta = this.restringirANoAplica(this.tiposEmpleadosPlantaCompleto, t => t.nombreTipoEmpleadoPlanta);
      this.empleadoForm.patchValue({ cboxIdTipoEmpleadoPlanta: this.tiposEmpleadosPlanta[0]?.idTipoEmpleadoPlanta || '' }, { emitEvent: false });

      this.actualizarOpcionesClasificacion();
      this.clasificacionesEmpleadosPlanta = this.restringirANoAplica(this.clasificacionesEmpleadosPlanta, c => c.nombreClasificacionEmpleadoPlanta);
      this.empleadoForm.patchValue({ cboxIdClasificacionEmpleadoPlanta: this.clasificacionesEmpleadosPlanta[0]?.idClasificacionEmpleadoPlanta || '' }, { emitEvent: false });

      this.actualizarOpcionesSubclasificacion();
      this.subclasificacionesEmpleadosPlanta = this.restringirANoAplica(this.subclasificacionesEmpleadosPlanta, s => s.nombreSubclasificacionEmpleadoPlanta);
      this.empleadoForm.patchValue({ cboxIdSubclasificacionEmpleadoPlanta: this.subclasificacionesEmpleadosPlanta[0]?.idSubclasificacionEmpleadoPlanta || '' }, { emitEvent: false });
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
    const idTipoEmpleadoPlanta = this.empleadoForm?.value.cboxIdTipoEmpleadoPlanta;
    this.clasificacionesEmpleadosPlanta = idTipoEmpleadoPlanta
      ? this.clasificacionesEmpleadosPlantaCompleto.filter(c => c.tipoEmpleadoPlantaDTO?.idTipoEmpleadoPlanta === Number(idTipoEmpleadoPlanta))
      : [];
  }

  //FILTRA LA SUBCLASIFICACIÓN POR LA CLASIFICACIÓN SELECCIONADA (RELACIÓN PADRE-HIJO REAL DEL BACKEND):
  actualizarOpcionesSubclasificacion(): void {
    const idClasificacion = this.empleadoForm?.value.cboxIdClasificacionEmpleadoPlanta;
    this.subclasificacionesEmpleadosPlanta = idClasificacion
      ? this.subclasificacionesEmpleadosPlantaCompleto.filter(s => s.clasificacionEmpleadoPlantaDTO?.idClasificacionEmpleadoPlanta === Number(idClasificacion))
      : [];
  }

  //AL CAMBIAR EL TIPO DE EMPLEADO PLANTA: LIMPIA CLASIFICACIÓN Y SUBCLASIFICACIÓN Y RECALCULA LA CASCADA:
  cambiarTipoEmpleadoPlanta(): void {
    this.empleadoForm.patchValue({ cboxIdClasificacionEmpleadoPlanta: '', cboxIdSubclasificacionEmpleadoPlanta: '' }, { emitEvent: false });
    this.actualizarOpcionesClasificacion();
    this.actualizarOpcionesSubclasificacion();
  }

  //AL CAMBIAR LA CLASIFICACIÓN: LIMPIA LA SUBCLASIFICACIÓN Y RECALCULA LA CASCADA:
  cambiarClasificacion(): void {
    this.empleadoForm.patchValue({ cboxIdSubclasificacionEmpleadoPlanta: '' }, { emitEvent: false });
    this.actualizarOpcionesSubclasificacion();
  }

  //MÉTODO DE INICIALIZACIÓN DEL FORMULARIO (VACÍO — MODO GUARDAR):
  initForm(): void {
    this.empleadoForm = this.formBuilder.group({
      ctextIdEmpleado: new FormControl(''),
      //IDENTIFICACIÓN:
      cboxIdTipoDocumentoIdentificacion: new FormControl('', Validators.required),
      ctextNumeroDocumentoIdentificacionEmpleado: new FormControl('', Validators.required),
      ctextNombresEmpleado: new FormControl('', Validators.required),
      ctextPrimerApellidoEmpleado: new FormControl('', Validators.required),
      ctextSegundoApellidoEmpleado: new FormControl(''),
      //CLASIFICACIÓN:
      cboxIdTipoEmpleado: new FormControl('', Validators.required),
      cboxIdTipoEmpleadoPlanta: new FormControl('', Validators.required),
      cboxIdClasificacionEmpleadoPlanta: new FormControl('', Validators.required),
      cboxIdSubclasificacionEmpleadoPlanta: new FormControl('', Validators.required),
      //CONTACTO:
      ctextDireccionEmpleado: new FormControl(''),
      ctextTelefonoEmpleado: new FormControl(''),
      ctextMovilEmpleado: new FormControl('', Validators.required),
      ctextCorreoElectronicoPersonalEmpleado: new FormControl(''),
      ctextCorreoElectronicoInstitucionalEmpleado: new FormControl(''),
      //ORIGEN:
      ctextPaisOrigenEmpleado: new FormControl(''),
      ctextDepartamentooEstadoOrigenEmpleado: new FormControl(''),
      ctextCiudadOrigenEmpleado: new FormControl(''),
      //FOTO / FECHAS / ESTADO:
      ctextNombreArchivoFotoExtensionOFormatoEmpleado: new FormControl(''),
      ctextFechaHMSIngresoEmpleado: new FormControl({ value: this.obtenerFechaHoraActual(), disabled: true }),
      ctextFechaHMSModificacionEmpleado: new FormControl({ value: '', disabled: true }),
      cboxEstadoEmpleado: new FormControl('ACTIVO', Validators.required)
    });
  }

  //CARGA LOS DATOS DEL EMPLEADO DESDE EL BACKEND Y LLENA EL FORMULARIO:
  cargarDatosEmpleado(): void {
    if (!this.empleadoData?.idEmpleado) return;
    this.empleadosService.getEmployeebyId(Number(this.empleadoData.idEmpleado))
      .subscribe({
        next: (respuesta) => {
          this.empleado = respuesta.empleadoDTO;
          this.changeDetectorRef.detectChanges();
          this.chargueForm();
          if (this.empleado.nombreArchivoFotoExtensionOFormatoEmpleado) {
            this.resolverPreviewFotoEmpleado(String(this.empleado.nombreArchivoFotoExtensionOFormatoEmpleado));
          }
        },
        error: (err) => {
          console.error('ERROR AL CARGAR DATOS DEL EMPLEADO: ', err);
          this.alertaMensajeError('Error', 'Error al cargar los datos del empleado.');
        }
      });
  }

  //MÉTODO DE CARGUE DEL FORMULARIO CON DATOS DEL BACKEND (MODOS MODIFICAR Y ELIMINAR):
  chargueForm(): void {
    const e = this.empleado;

    //RECALCULA LA CASCADA DE COMBOS SEGÚN LOS DATOS YA GUARDADOS DEL EMPLEADO, ANTES DE APLICAR LOS VALORES AL FORMULARIO
    //(ASÍ EL COMBO DE TIPO PLANTA/CLASIFICACIÓN/SUBCLASIFICACIÓN YA TIENE LA OPCIÓN GUARDADA DISPONIBLE PARA SELECCIONAR):
    const nombreTipoEmpleado = String(e.tipoEmpleadoDTO?.nombreTipoEmpleado || '').toUpperCase();

    if (nombreTipoEmpleado === 'DISPONIBLE' || nombreTipoEmpleado === 'RELEVANTE') {
      //SOLO "NO APLICA" ES VÁLIDO PARA ESTOS TIPOS DE EMPLEADO EN LOS 3 NIVELES:
      this.tiposEmpleadosPlanta = this.restringirANoAplica(this.tiposEmpleadosPlantaCompleto, t => t.nombreTipoEmpleadoPlanta);
      this.clasificacionesEmpleadosPlanta = this.restringirANoAplica(
        this.clasificacionesEmpleadosPlantaCompleto.filter(c => c.tipoEmpleadoPlantaDTO?.idTipoEmpleadoPlanta === e.tipoEmpleadoPlantaDTO?.idTipoEmpleadoPlanta),
        c => c.nombreClasificacionEmpleadoPlanta
      );
      this.subclasificacionesEmpleadosPlanta = this.restringirANoAplica(
        this.subclasificacionesEmpleadosPlantaCompleto.filter(s => s.clasificacionEmpleadoPlantaDTO?.idClasificacionEmpleadoPlanta === e.clasificacionEmpleadoPlantaDTO?.idClasificacionEmpleadoPlanta),
        s => s.nombreSubclasificacionEmpleadoPlanta
      );
    } else {
      //PLANTA (U OTRO): LAS 3 OPCIONES DE TIPO PLANTA QUEDAN DISPONIBLES, CLASIFICACIÓN/SUBCLASIFICACIÓN POR RELACIÓN REAL:
      this.actualizarOpcionesTipoEmpleadoPlanta();
      this.clasificacionesEmpleadosPlanta = e.tipoEmpleadoPlantaDTO?.idTipoEmpleadoPlanta
        ? this.clasificacionesEmpleadosPlantaCompleto.filter(c => c.tipoEmpleadoPlantaDTO?.idTipoEmpleadoPlanta === e.tipoEmpleadoPlantaDTO.idTipoEmpleadoPlanta)
        : [];
      this.subclasificacionesEmpleadosPlanta = e.clasificacionEmpleadoPlantaDTO?.idClasificacionEmpleadoPlanta
        ? this.subclasificacionesEmpleadosPlantaCompleto.filter(s => s.clasificacionEmpleadoPlantaDTO?.idClasificacionEmpleadoPlanta === e.clasificacionEmpleadoPlantaDTO.idClasificacionEmpleadoPlanta)
        : [];
    }

    this.empleadoForm.patchValue({
      ctextIdEmpleado: e.idEmpleado || '',
      cboxIdTipoDocumentoIdentificacion: e.tipoDocumentoIdentificacionDTO?.idTipoDocumentoIdentificacion || '',
      ctextNumeroDocumentoIdentificacionEmpleado: e.numeroDocumentoIdentificacionEmpleado || '',
      ctextNombresEmpleado: e.nombresEmpleado || '',
      ctextPrimerApellidoEmpleado: e.primerApellidoEmpleado || '',
      ctextSegundoApellidoEmpleado: e.segundoApellidoEmpleado || '',
      cboxIdTipoEmpleado: e.tipoEmpleadoDTO?.idTipoEmpleado || '',
      cboxIdTipoEmpleadoPlanta: e.tipoEmpleadoPlantaDTO?.idTipoEmpleadoPlanta || '',
      cboxIdClasificacionEmpleadoPlanta: e.clasificacionEmpleadoPlantaDTO?.idClasificacionEmpleadoPlanta || '',
      cboxIdSubclasificacionEmpleadoPlanta: e.subclasificacionEmpleadoPlantaDTO?.idSubclasificacionEmpleadoPlanta || '',
      ctextDireccionEmpleado: e.direccionEmpleado || '',
      ctextTelefonoEmpleado: e.telefonoEmpleado || '',
      ctextMovilEmpleado: e.movilEmpleado || '',
      ctextCorreoElectronicoPersonalEmpleado: e.correoElectronicoPersonalEmpleado || '',
      ctextCorreoElectronicoInstitucionalEmpleado: e.correoElectronicoInstitucionalEmpleado || '',
      ctextPaisOrigenEmpleado: e.paisOrigenEmpleado || '',
      ctextDepartamentooEstadoOrigenEmpleado: e.departamentooEstadoOrigenEmpleado || '',
      ctextCiudadOrigenEmpleado: e.ciudadOrigenEmpleado || '',
      ctextNombreArchivoFotoExtensionOFormatoEmpleado: e.nombreArchivoFotoExtensionOFormatoEmpleado || '',
      ctextFechaHMSIngresoEmpleado: this.formatearFechaParaInput(e.fechaHMSIngresoEmpleado),
      ctextFechaHMSModificacionEmpleado: this.obtenerFechaHoraActual(),
      cboxEstadoEmpleado: e.estadoEmpleado || 'ACTIVO'
    });
    this.changeDetectorRef.detectChanges();
  }

  //RETORNA LA FECHA Y HORA ACTUAL EN FORMATO YYYY-MM-DDTHH:mm:
  obtenerFechaHoraActual(): string {
    return new Date().toISOString().slice(0, 16);
  }

  //NORMALIZA UNA FECHA DEL BACKEND AL FORMATO YYYY-MM-DDTHH:mm QUE EXIGE EL INPUT datetime-local:
  formatearFechaParaInput(fecha: any): string {
    if (!fecha) return '';
    const s = String(fecha).replace(' ', 'T');
    return s.length > 16 ? s.slice(0, 16) : s;
  }

  //MÉTODO PARA MANEJAR LA SELECCIÓN DEL ARCHIVO DE FOTO — VALIDA PESO MÁXIMO (2 MB) Y EXTENSIÓN SOPORTADA ANTES DE ACEPTARLO:
  onSelectFileUserPhoto(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;
    const extension = (file.name.split('.').pop() || '').toString();
    const extensionesPermitidas = ['jpg', 'JPG', 'jpeg', 'JPEG', 'bmp', 'BMP', 'png', 'PNG', 'gif', 'GIF'];
    const tamanoMaximoBytes = 2000000; //2.0 MB.
    if (file.size > tamanoMaximoBytes) {
      this.alertaMensajeError('Error', 'El archivo excede el tamaño máximo permitido de 2.0 MB.');
      event.target.value = '';
      return;
    }
    if (!extensionesPermitidas.includes(extension)) {
      this.alertaMensajeError('Error', 'El archivo debe tener una extensión válida (jpg, jpeg, bmp, png o gif).');
      event.target.value = '';
      return;
    }
    this.selectedFileUserPhoto = file;
    this.isSelectedFileUserPhoto = true;
  }

  //MÉTODO PARA CANCELAR LA SELECCIÓN PENDIENTE DE UN ARCHIVO NUEVO (NO BORRA LA FOTO YA ALMACENADA):
  onRemoveFileUserPhoto(): void {
    this.selectedFileUserPhoto = null;
    this.isSelectedFileUserPhoto = false;
  }

  //MÉTODO QUE ABRE EL DIÁLOGO DE CONFIRMACIÓN SI/NO ANTES DE ELIMINAR LA FOTO YA ALMACENADA DEL EMPLEADO:
  confirmarEliminarFotoEmpleado(): void {
    if (!this.empleado?.nombreArchivoFotoExtensionOFormatoEmpleado) return;
    this.banderaConfirmacionEliminacionFoto = true;
  }

  //MÉTODO DE LA ALERTA DE CONFIRMACIÓN NO — CANCELA LA ELIMINACIÓN DE LA FOTO:
  noEliminarFotoEmpleado(): void {
    this.banderaConfirmacionEliminacionFoto = false;
  }

  //MÉTODO DE LA ALERTA DE CONFIRMACIÓN SI — ELIMINA DEFINITIVAMENTE LA FOTO YA ALMACENADA DEL EMPLEADO: BORRA EL ARCHIVO FÍSICO DEL SERVIDOR DE ARCHIVOS Y LIMPIA EL CAMPO EN BASE DE DATOS:
  siEliminarFotoEmpleado(): void {
    this.banderaConfirmacionEliminacionFoto = false;
    const nombreArchivoAEliminar = this.empleado?.nombreArchivoFotoExtensionOFormatoEmpleado;
    if (!nombreArchivoAEliminar) return;

    this.parametrosSistemaService.getSystemParameterbyId(1).subscribe({
      next: (respuestaParametros) => {
        const parametrosSistema = respuestaParametros.parametrosSistemaDTO;
        const ruta = String(parametrosSistema.rutaDestinoCarpetaPrincipalServidorAplicaciones)
          + String(parametrosSistema.rutaDestinoArchivosEmpleados) + String(nombreArchivoAEliminar);

        this.gestionArchivosService.deleteFile({ filePath: ruta }).subscribe({
          next: () => {
            //LIMPIA EL CAMPO DE LA FOTO EN EL REGISTRO DEL EMPLEADO:
            const empleadoSinFoto: EmpleadosI = { ...this.empleado, nombreArchivoFotoExtensionOFormatoEmpleado: '' };
            this.empleadosService.updateEmployee(empleadoSinFoto).subscribe({
              next: () => {
                this.previewUrlFotoEmpleado = null;
                this.empleado.nombreArchivoFotoExtensionOFormatoEmpleado = '';
                this.empleadoForm.controls['ctextNombreArchivoFotoExtensionOFormatoEmpleado'].setValue('');
                this.alertaMensajeExito('Confirmación', 'Foto del empleado eliminada correctamente.');
              },
              error: (err) => {
                console.error('ERROR AL LIMPIAR EL CAMPO DE LA FOTO DEL EMPLEADO: ', err);
                this.alertaMensajeError('Error', 'Se eliminó el archivo, pero no se pudo actualizar el registro del empleado.');
              }
            });
          },
          error: (err) => {
            console.error('ERROR AL ELIMINAR LA FOTO DEL EMPLEADO: ', err);
            this.alertaMensajeError('Error', 'No se pudo eliminar la foto del empleado.');
          }
        });
      },
      error: (err) => {
        console.error('ERROR AL OBTENER LOS PARÁMETROS DEL SISTEMA PARA ELIMINAR LA FOTO: ', err);
        this.alertaMensajeError('Error', 'No se pudo obtener la configuración de archivos del sistema.');
      }
    });
  }

  //ENCRIPTA EL NÚMERO DE DOCUMENTO DE IDENTIFICACIÓN CON BTOA x2 PARA CONFORMAR EL NOMBRE DEL ARCHIVO DE LA FOTO:
  obtenerNumeroDocumentoIdentificacionEmpleadoEncriptado(numeroDocumentoIdentificacion: any): string {
    let numeroDocumentoIdentificacionEncriptado = numeroDocumentoIdentificacion;
    for (let i = 0; i < 2; i++) {
      numeroDocumentoIdentificacionEncriptado = btoa(numeroDocumentoIdentificacionEncriptado);
    }
    return numeroDocumentoIdentificacionEncriptado;
  }

  //RESUELVE LA URL PÚBLICA DE LA FOTO YA ALMACENADA EN EL SERVIDOR DE ARCHIVOS PARA MOSTRARLA COMO VISTA PREVIA:
  resolverPreviewFotoEmpleado(nombreArchivo: string): void {
    this.parametrosSistemaService.getSystemParameterbyId(1).subscribe({
      next: (respuestaParametros) => {
        const parametrosSistema = respuestaParametros.parametrosSistemaDTO;
        //NOTA: NO SE CODIFICA AQUÍ EL NOMBRE DEL ARCHIVO — GestionArchivosService.getFile() YA ENVÍA LA RUTA COMPLETA
        //A TRAVÉS DE HttpParams, QUE LA CODIFICA AUTOMÁTICAMENTE (CODIFICARLA AQUÍ TAMBIÉN LA DEJARÍA CODIFICADA DOS VECES):
        const rutaCompleta = String(parametrosSistema.rutaDestinoCarpetaPrincipalServidorAplicaciones)
          + String(parametrosSistema.rutaDestinoArchivosEmpleados) + nombreArchivo;
        this.gestionArchivosService.getFile(rutaCompleta).subscribe({
          next: (respuestaArchivo) => {
            //SE DESCARGAN LOS BYTES DEL ARCHIVO AUTENTICADO (VER NOTA EN GestionArchivosService.getFileBytes) Y SE
            //ARMA UNA URL LOCAL DE OBJETO PARA USARLA COMO <img [src]>:
            this.gestionArchivosService.getFileBytes(respuestaArchivo.rutaEstatica).subscribe({
              next: (blob) => {
                if (this.previewUrlFotoEmpleado) URL.revokeObjectURL(this.previewUrlFotoEmpleado);
                this.previewUrlFotoEmpleado = URL.createObjectURL(blob);
              },
              error: () => { this.previewUrlFotoEmpleado = null; }
            });
          },
          error: () => { this.previewUrlFotoEmpleado = null; }
        });
      },
      error: (err) => {
        console.error('ERROR AL OBTENER LOS PARÁMETROS DEL SISTEMA PARA LA VISTA PREVIA DE LA FOTO: ', err);
        this.previewUrlFotoEmpleado = null;
      }
    });
  }

  //MÉTODO DE LOS CRUDS — GUARDAR, MODIFICAR O ELIMINAR REGISTRO:
  accionesGuardarModificarEliminarRegistro(formValues: any): void {
    const fv = this.empleadoForm.getRawValue();

    //MODO GUARDAR Y MODO MODIFICAR — SE CONSULTAN LOS PARÁMETROS DEL SISTEMA UNA SOLA VEZ (RUTAS DE ARCHIVOS)
    //ANTES DE CONTINUAR, YA QUE AMBOS MODOS PUEDEN NECESITAR CONFORMAR LA RUTA DE LA FOTO DEL EMPLEADO:
    if (this.banderaCrudGuardar) {
      if (this.empleadoForm.invalid) return;
      this.parametrosSistemaService.getSystemParameterbyId(1).subscribe({
        next: (respuestaParametros) => this.procesarGuardarEmpleado(fv, respuestaParametros.parametrosSistemaDTO),
        error: (err) => {
          console.error('ERROR AL OBTENER LOS PARÁMETROS DEL SISTEMA: ', err);
          this.alertaMensajeError('Error', 'No se pudo obtener la configuración de rutas de archivos del sistema.');
        }
      });
    }

    if (this.banderaCrudModificar) {
      if (this.empleadoForm.invalid) return;
      this.parametrosSistemaService.getSystemParameterbyId(1).subscribe({
        next: (respuestaParametros) => this.procesarModificarEmpleado(fv, respuestaParametros.parametrosSistemaDTO),
        error: (err) => {
          console.error('ERROR AL OBTENER LOS PARÁMETROS DEL SISTEMA: ', err);
          this.alertaMensajeError('Error', 'No se pudo obtener la configuración de rutas de archivos del sistema.');
        }
      });
    }

    //MODO ELIMINAR — muestra el diálogo de confirmación SI/NO:
    if (this.banderaCrudEliminar) {
      this.confirmacionEliminacionRegistro();
    }
  }

  //PROCESA EL GUARDADO DEL EMPLEADO YA CON LOS PARÁMETROS DEL SISTEMA RESUELTOS (PARA LA RUTA DE LA FOTO):
  private procesarGuardarEmpleado(fv: any, parametrosSistema: ParametrosSistemaI): void {
    //SI SE SELECCIONÓ UNA FOTO NUEVA, SE CALCULA SU NOMBRE DE DESTINO (NÚMERO DE DOCUMENTO ENCRIPTADO + EXTENSIÓN)
    //ANTES DE CONSTRUIR EL OBJETO DEL EMPLEADO, PARA QUE EL CAMPO DE LA FOTO QUEDE CORRECTO DESDE EL PRIMER GUARDADO:
    let nombreArchivoNuevo: string | null = null;
    if (this.selectedFileUserPhoto) {
      const extension = (this.selectedFileUserPhoto.name.split('.').pop() || '').toString();
      nombreArchivoNuevo = this.obtenerNumeroDocumentoIdentificacionEmpleadoEncriptado(fv.ctextNumeroDocumentoIdentificacionEmpleado) + '.' + extension;
    }

    const nuevoEmpleado: EmpleadosI = this.construirEmpleadoDesdeFormulario(fv, false);
    nuevoEmpleado.nombreArchivoFotoExtensionOFormatoEmpleado = nombreArchivoNuevo || '';

    this.empleadosService.addEmployee(nuevoEmpleado).subscribe({
      next: (respuesta) => {
        if (respuesta.mensaje && respuesta.mensaje.toLowerCase().includes('éxito')) {
          //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL CREAR UN EMPLEADO (VER AuditoriasSistemaService.registrarAuditoria):
          this.auditoriasSistemaService.registerSystemAudit(
            'CREAR EMPLEADO',
            `Se creó el empleado ${nuevoEmpleado.nombresEmpleado} ${nuevoEmpleado.primerApellidoEmpleado} (documento ${nuevoEmpleado.numeroDocumentoIdentificacionEmpleado}).`
          );
          this.alertaMensajeExito('Confirmación', respuesta.mensaje);

          //SI HABÍA UNA FOTO NUEVA SELECCIONADA, SE SUBE AL SERVIDOR DE ARCHIVOS DE FORMA INDEPENDIENTE:
          if (nombreArchivoNuevo && this.selectedFileUserPhoto) {
            const rutaDestino = String(parametrosSistema.rutaDestinoCarpetaPrincipalServidorAplicaciones)
              + String(parametrosSistema.rutaDestinoArchivosEmpleados) + nombreArchivoNuevo;
            this.gestionArchivosService.uploadFile(this.selectedFileUserPhoto, rutaDestino).subscribe({
              next: () => {},
              error: (err) => {
                console.error('ERROR AL SUBIR LA FOTO DEL EMPLEADO: ', err);
                this.alertaMensajeError('Aviso', 'El empleado se creó, pero no se pudo subir la foto.');
              }
            });
          }

          setTimeout(() => this.closeModal(), 500);
        } else {
          this.alertaMensajeError('Error', respuesta.mensaje || 'Error al guardar el empleado.');
        }
      },
      error: (err) => {
        console.error('ERROR AL GUARDAR EMPLEADO: ', err);
        this.alertaMensajeError('Error', 'Error al guardar el empleado.');
      }
    });
  }

  //PROCESA LA MODIFICACIÓN DEL EMPLEADO YA CON LOS PARÁMETROS DEL SISTEMA RESUELTOS (PARA LA RUTA DE LA FOTO):
  private procesarModificarEmpleado(fv: any, parametrosSistema: ParametrosSistemaI): void {
    //DECIDE QUÉ HACER CON EL ARCHIVO DE LA FOTO: SUBIR UNO NUEVO, RENOMBRAR EL EXISTENTE (SI SOLO CAMBIÓ EL
    //NÚMERO DE DOCUMENTO SIN SELECCIONAR UNA FOTO NUEVA) O NO HACER NADA:
    const docNumeroAnterior = String(this.empleado.numeroDocumentoIdentificacionEmpleado);
    const docNumeroNuevo = String(fv.ctextNumeroDocumentoIdentificacionEmpleado);
    const nombreArchivoAnterior = this.empleado.nombreArchivoFotoExtensionOFormatoEmpleado ? String(this.empleado.nombreArchivoFotoExtensionOFormatoEmpleado) : '';
    const docNumeroCambio = docNumeroAnterior !== docNumeroNuevo;
    let nombreArchivoNuevo = nombreArchivoAnterior;
    let accionArchivo: 'ninguna' | 'subir' | 'renombrar' = 'ninguna';

    if (this.selectedFileUserPhoto) {
      const extension = (this.selectedFileUserPhoto.name.split('.').pop() || '').toString();
      nombreArchivoNuevo = this.obtenerNumeroDocumentoIdentificacionEmpleadoEncriptado(docNumeroNuevo) + '.' + extension;
      accionArchivo = 'subir';
    } else if (docNumeroCambio && nombreArchivoAnterior) {
      const extensionAnterior = (nombreArchivoAnterior.split('.').pop() || '').toString();
      nombreArchivoNuevo = this.obtenerNumeroDocumentoIdentificacionEmpleadoEncriptado(docNumeroNuevo) + '.' + extensionAnterior;
      accionArchivo = 'renombrar';
    }

    const empleadoModificado: EmpleadosI = this.construirEmpleadoDesdeFormulario(fv, true);
    empleadoModificado.nombreArchivoFotoExtensionOFormatoEmpleado = nombreArchivoNuevo || '';

    this.empleadosService.updateEmployee(empleadoModificado).subscribe({
      next: (respuesta) => {
        if (respuesta.mensaje && respuesta.mensaje.toLowerCase().includes('éxito')) {
          //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL MODIFICAR UN EMPLEADO (VER AuditoriasSistemaService.registrarAuditoria):
          this.auditoriasSistemaService.registerSystemAudit(
            'MODIFICAR EMPLEADO',
            `Se modificó el empleado ${empleadoModificado.nombresEmpleado} ${empleadoModificado.primerApellidoEmpleado} (documento ${empleadoModificado.numeroDocumentoIdentificacionEmpleado}).`
          );
          this.alertaMensajeExito('Confirmación', respuesta.mensaje);

          //EJECUTA LA ACCIÓN DE ARCHIVO QUE CORRESPONDA SOBRE LA FOTO DEL EMPLEADO, DE FORMA INDEPENDIENTE AL GUARDADO DEL REGISTRO:
          const rutaBase = String(parametrosSistema.rutaDestinoCarpetaPrincipalServidorAplicaciones) + String(parametrosSistema.rutaDestinoArchivosEmpleados);
          if (accionArchivo === 'subir' && this.selectedFileUserPhoto) {
            this.gestionArchivosService.uploadFile(this.selectedFileUserPhoto, rutaBase + nombreArchivoNuevo).subscribe({
              next: () => {},
              error: (err) => {
                console.error('ERROR AL SUBIR LA FOTO DEL EMPLEADO: ', err);
                this.alertaMensajeError('Aviso', 'El empleado se modificó, pero no se pudo subir la nueva foto.');
              }
            });
            //LIMPIEZA DEL ARCHIVO ANTERIOR SI QUEDÓ CON UN NOMBRE DISTINTO (POR EJEMPLO, CAMBIÓ EL DOCUMENTO Y TAMBIÉN LA FOTO):
            if (nombreArchivoAnterior && nombreArchivoAnterior !== nombreArchivoNuevo) {
              this.gestionArchivosService.deleteFile({ filePath: rutaBase + nombreArchivoAnterior }).subscribe({
                next: () => {},
                error: (err) => console.error('ERROR AL ELIMINAR LA FOTO ANTERIOR DEL EMPLEADO: ', err)
              });
            }
          } else if (accionArchivo === 'renombrar') {
            this.gestionArchivosService.renameFile({ oldPath: rutaBase + nombreArchivoAnterior, newPath: rutaBase + nombreArchivoNuevo }).subscribe({
              next: () => {},
              error: (err) => {
                console.error('ERROR AL RENOMBRAR LA FOTO DEL EMPLEADO: ', err);
                this.alertaMensajeError('Aviso', 'El empleado se modificó, pero no se pudo renombrar el archivo de la foto.');
              }
            });
          }

          setTimeout(() => this.closeModal(), 500);
        } else {
          this.alertaMensajeError('Error', respuesta.mensaje || 'Error al modificar el empleado.');
        }
      },
      error: (err) => {
        console.error('ERROR AL MODIFICAR EMPLEADO: ', err);
        this.alertaMensajeError('Error', 'Error al modificar el empleado.');
      }
    });
  }

  //CONSTRUYE EL OBJETO EmpleadosI DESDE LOS VALORES DEL FORMULARIO:
  private construirEmpleadoDesdeFormulario(fv: any, esModificacion: boolean): EmpleadosI {
    const obj: EmpleadosI = {
      tipoDocumentoIdentificacionDTO: {
        idTipoDocumentoIdentificacion: Number(fv.cboxIdTipoDocumentoIdentificacion),
        nombreTipoDocumentoIdentificacion: ''
      },
      numeroDocumentoIdentificacionEmpleado: fv.ctextNumeroDocumentoIdentificacionEmpleado,
      nombresEmpleado: fv.ctextNombresEmpleado,
      primerApellidoEmpleado: fv.ctextPrimerApellidoEmpleado,
      segundoApellidoEmpleado: fv.ctextSegundoApellidoEmpleado || '',
      tipoEmpleadoDTO: {
        idTipoEmpleado: Number(fv.cboxIdTipoEmpleado),
        nombreTipoEmpleado: ''
      },
      tipoEmpleadoPlantaDTO: {
        idTipoEmpleadoPlanta: Number(fv.cboxIdTipoEmpleadoPlanta),
        nombreTipoEmpleadoPlanta: ''
      },
      clasificacionEmpleadoPlantaDTO: {
        idClasificacionEmpleadoPlanta: Number(fv.cboxIdClasificacionEmpleadoPlanta),
        nombreClasificacionEmpleadoPlanta: '',
        tipoEmpleadoPlantaDTO: { idTipoEmpleadoPlanta: Number(fv.cboxIdTipoEmpleadoPlanta), nombreTipoEmpleadoPlanta: '' }
      },
      subclasificacionEmpleadoPlantaDTO: {
        idSubclasificacionEmpleadoPlanta: Number(fv.cboxIdSubclasificacionEmpleadoPlanta),
        nombreSubclasificacionEmpleadoPlanta: '',
        clasificacionEmpleadoPlantaDTO: {
          idClasificacionEmpleadoPlanta: Number(fv.cboxIdClasificacionEmpleadoPlanta),
          nombreClasificacionEmpleadoPlanta: '',
          tipoEmpleadoPlantaDTO: { idTipoEmpleadoPlanta: Number(fv.cboxIdTipoEmpleadoPlanta), nombreTipoEmpleadoPlanta: '' }
        }
      },
      direccionEmpleado: fv.ctextDireccionEmpleado || '',
      telefonoEmpleado: fv.ctextTelefonoEmpleado || '',
      movilEmpleado: fv.ctextMovilEmpleado,
      correoElectronicoPersonalEmpleado: fv.ctextCorreoElectronicoPersonalEmpleado || '',
      correoElectronicoInstitucionalEmpleado: fv.ctextCorreoElectronicoInstitucionalEmpleado || '',
      paisOrigenEmpleado: fv.ctextPaisOrigenEmpleado || '',
      departamentooEstadoOrigenEmpleado: fv.ctextDepartamentooEstadoOrigenEmpleado || '',
      ciudadOrigenEmpleado: fv.ctextCiudadOrigenEmpleado || '',
      nombreArchivoFotoExtensionOFormatoEmpleado: fv.ctextNombreArchivoFotoExtensionOFormatoEmpleado || '',
      fechaHMSIngresoEmpleado: fv.ctextFechaHMSIngresoEmpleado || this.obtenerFechaHoraActual(),
      fechaHMSModificacionEmpleado: esModificacion ? this.obtenerFechaHoraActual() : '',
      estadoEmpleado: fv.cboxEstadoEmpleado
    };
    if (esModificacion) {
      obj.idEmpleado = Number(fv.ctextIdEmpleado);
    }
    return obj;
  }

  //MÉTODO QUE MUESTRA EL DIÁLOGO DE CONFIRMACIÓN DE ELIMINACIÓN:
  confirmacionEliminacionRegistro(): void {
    this.banderaConfirmacionEliminacion = true;
  }

  //MÉTODO DE LA ALERTA DE CONFIRMACIÓN SI — EJECUTA LA ELIMINACIÓN:
  siConfirmacionEliminacionRegistro(): void {
    this.banderaConfirmacionEliminacion = false;
    const fv = this.empleadoForm.getRawValue();
    const idEmpleado = Number(fv.ctextIdEmpleado);
    this.empleadosService.deleteEmployee(idEmpleado).subscribe({
      next: (respuesta) => {
        if (respuesta.mensaje && respuesta.mensaje.toLowerCase().includes('éxito')) {
          //AQUÍ SE REGISTRA LA AUDITORÍA DEL SISTEMA AL ELIMINAR UN EMPLEADO (VER AuditoriasSistemaService.registrarAuditoria):
          this.auditoriasSistemaService.registerSystemAudit(
            'ELIMINAR EMPLEADO',
            `Se eliminó el empleado ${fv.ctextNombresEmpleado} ${fv.ctextPrimerApellidoEmpleado} (documento ${fv.ctextNumeroDocumentoIdentificacionEmpleado}).`
          );
          this.alertaMensajeExito('Confirmación', respuesta.mensaje);

          //SI EL EMPLEADO ELIMINADO TENÍA UNA FOTO ASOCIADA, SE INTENTA BORRAR EL ARCHIVO FÍSICO DEL SERVIDOR
          //DE ARCHIVOS (BEST-EFFORT, NO BLOQUEA EL CIERRE DEL MODAL AL YA HABERSE ELIMINADO EL REGISTRO):
          const nombreArchivoExistente = this.empleado?.nombreArchivoFotoExtensionOFormatoEmpleado;
          if (nombreArchivoExistente) {
            this.parametrosSistemaService.getSystemParameterbyId(1).subscribe({
              next: (respuestaParametros) => {
                const ps = respuestaParametros.parametrosSistemaDTO;
                const ruta = String(ps.rutaDestinoCarpetaPrincipalServidorAplicaciones) + String(ps.rutaDestinoArchivosEmpleados) + String(nombreArchivoExistente);
                this.gestionArchivosService.deleteFile({ filePath: ruta }).subscribe({
                  next: () => {},
                  error: (err) => console.error('ERROR AL ELIMINAR LA FOTO DEL EMPLEADO: ', err)
                });
              },
              error: (err) => console.error('ERROR AL OBTENER PARÁMETROS PARA ELIMINAR LA FOTO: ', err)
            });
          }

          setTimeout(() => this.closeModal(), 500);
        } else {
          this.alertaMensajeError('Error', respuesta.mensaje || 'Error al eliminar el empleado.');
        }
      },
      error: (err) => {
        console.error('ERROR AL ELIMINAR EMPLEADO: ', err);
        this.alertaMensajeError('Error', 'Error al eliminar el empleado.');
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
