//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { SessionService } from '../../services/session/session.service';
import { HistorialMovimientosEmpleadosService } from '../../services/gestion-personal/historial-movimientos-empleados/historialMovimientosEmpleados.service';
import { HistorialMovimientosEmpleadosI } from '../../interfaces/gestion-personal/historial-movimientos-empleados/historialMovimientosEmpleados.interface';
import { EmpleadosService } from '../../services/gestion-personal/empleados/empleados.service';
import { PuestosSedesEstablecimientosClientesService } from '../../services/panel-control/gestion-establecimientos-clientes/sedes-establecimientos-clientes/puestos-sedes-establec-cliente/puestosSedesEstablecimientosClientes.service';
import { AlertasSeguridadService } from '../../services/reportes-seguridad/alertas-seguridad.service';
import { UsuariosService } from '../../services/panel-control/usuarios/usuarios.service';
import { ParametrosSistemaService } from '../../services/panel-control/parametros-sistema/parametros-sistema.service';
import { GestionArchivosService } from '../../services/gestion-archivos/gestion-archivos.service';
import { TarifasEmpleadosService } from '../../services/panel-control/tarifas-empleados/tarifas-empleados.service';
import { ProgramacionesTurnosEmpleadosService } from '../../services/gestion-personal/programaciones-turnos-empleados/programacionesTurnosEmpleados.service';
import { EmpleadosI } from '../../interfaces/gestion-personal/empleados/empleados.interface';
import { forkJoin } from 'rxjs';
import { determinarVentanaDiurnaDesdeCatalogo, clasificarHorasTrabajadasPorEmpleado } from '../../services/gestion-personal/liquidaciones-empleados/liquidacion-empleado-calculo.util';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss']
})
export class InicioComponent implements OnInit, OnDestroy {

  //DECLARACIÓN DE VARIABLES GLOBALES:
  nicknameUsuarioLogueado: string = '';
  nombreUsuarioLogueado: string = '';
  tipoUsuarioLogueado: string = '';

  //LIQUIDACIÓN DEL AÑO EN CURSO DEL USUARIO CONECTADO (SÓLO SE MUESTRA SI EL USUARIO ESTÁ REGISTRADO COMO EMPLEADO
  //Y REGISTRA HORAS LABORADAS EN EL SISTEMA — VER cargarLiquidacionUsuarioConectado):
  mostrarLiquidacionUsuarioConectado: boolean = false;
  totalHorasLaboradasUsuarioConectado: number = 0;
  totalValorBrutoUsuarioConectado: number = 0;
  totalValorNetoUsuarioConectado: number = 0;
  private readonly porcentajeDescuentoLiquidacion = 0.08;
  anioActual: number = new Date().getFullYear();
  menuPrincipalActivo: string = 'inicio';

  //FECHA Y HORA ACTUAL MOSTRADA ENCIMA DEL LOGO DEL CABEZOTE (ZONA HORARIA AMÉRICA/BOGOTÁ):
  fechaHoraActual: Date = new Date();
  private intervaloRelojFechaHora?: ReturnType<typeof setInterval>;

  //VISTA PREVIA DE LA FOTO DEL USUARIO LOGUEADO PARA EL AVATAR DEL CABEZOTE (VER cargarFotoUsuarioLogueado):
  previewUrlFotoUsuarioLogueado: string | null = null;

  //CONTADORES DE PERSONAL Y DE PUESTOS DE TRABAJO POR ESTADO (ACTIVO/INACTIVO), TRAÍDOS DEL BACKEND:
  totalEmpleadosActivos: number = 0;
  totalEmpleadosInactivos: number = 0;
  totalPuestosActivos: number = 0;
  totalPuestosInactivos: number = 0;

  //TOTAL DE ALERTAS DE SEGURIDAD, CALCULADO POR EL MISMO AlertasSeguridadService QUE USA ReportesSeguridadComponent
  //(PARA QUE ESTE NÚMERO SIEMPRE COINCIDA CON EL DETALLE DE "Reportes de Seguridad"):
  totalAlertasSeguridad: number = 0;

  //ÚLTIMOS MOVIMIENTOS DE PERSONAL, TRAÍDOS PAGINADOS DIRECTAMENTE DEL BACKEND (listaPag) ORDENADOS DEL MÁS RECIENTE AL MÁS ANTIGUO:
  ultimosMovimientosPersonal: HistorialMovimientosEmpleadosI[] = [];
  totalRegistrosMovimientos: number = 0;
  paginaActualMovimientos: number = 0;
  tandaNumeroRegistrosporPaginaMovimientos: number = 5;

  //PRIVILEGIOS Y RESTRICCIONES:
  sioNoPrivilegioyRestriccionAccesoUsuarioCRUDVer: string = 'NO';

  //MODAL DE UBICACIÓN DEL TURNO ACTUAL (ESTABLECIMIENTO → SEDE → PUESTO) AL CLICKEAR "EN TURNO"
  //(MISMO MODAL QUE EN listado-empleados.component.ts):
  modalUbicacionTurnoVisible: boolean = false;
  establecimientoEnTurno: any = null;
  sedeEnTurno: any = null;
  puestoEnTurno: any = null;
  programacionEnTurno: any = null;

  //ESTADO DEL SIDEBAR EN PANTALLAS MÓVILES (SE ABRE/CIERRA COMO UN PANEL DESLIZANTE, VER
  //menu-principal-lateral-izquierdo.component.scss PARA EL BREAKPOINT):
  sidebarMobileAbierto: boolean = false;

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private router: Router,
    private location: Location,
    private sessionService: SessionService,
    private historialMovimientosEmpleadosService: HistorialMovimientosEmpleadosService,
    private empleadosService: EmpleadosService,
    private puestosSedesEstablecimientosClientesService: PuestosSedesEstablecimientosClientesService,
    private alertasSeguridadService: AlertasSeguridadService,
    private usuariosService: UsuariosService,
    private parametrosSistemaService: ParametrosSistemaService,
    private gestionArchivosService: GestionArchivosService,
    private tarifasEmpleadosService: TarifasEmpleadosService,
    private programacionesTurnosEmpleadosService: ProgramacionesTurnosEmpleadosService
  ) {}

  //MÉTODO PRINCIPAL DEL COMPONENTE DONDE INVOCA A TODOS LOS MÉTODOS:
  ngOnInit(): void {
    this.nicknameUsuarioLogueado = localStorage.getItem('nicknameUsuarioLogueado') || '';
    this.nombreUsuarioLogueado   = localStorage.getItem('nombreUsuario') || this.nicknameUsuarioLogueado;

    // Restaura la sección activa desde la URL al cargar/refrescar la página.
    const path = this.location.path();
    if (path && path !== '/inicio') {
      const seccion = path.replace(/^\//, '');
      if (seccion) {
        this.menuPrincipalActivo = seccion;
      }
    }

    this.cargarUltimosMovimientosPersonal();
    this.cargarContadoresPersonalYPuestos();
    this.cargarTotalAlertasSeguridad();
    this.cargarFotoUsuarioLogueado();
    this.cargarTipoUsuarioLogueado();

    //ACTUALIZA LA FECHA Y HORA MOSTRADA ENCIMA DEL LOGO CADA MINUTO:
    this.intervaloRelojFechaHora = setInterval(() => {
      this.fechaHoraActual = new Date();
    }, 60000);

    //CARGA UNA ÚNICA VEZ POR SESIÓN LOS PRIVILEGIOS Y RESTRICCIONES DE ACCESO DEL USUARIO LOGUEADO, PARA QUE EL
    //MENÚ LATERAL Y LOS BOTONES DE CADA CRUD PUEDAN CONSULTARLOS DE FORMA SÍNCRONA (VER SessionService):
    this.sessionService.cargarPrivilegios().subscribe({
      next: () => this.actualizarPrivilegiosyRestriccionesCRUD(),
      error: (err) => console.error('ERROR AL CARGAR LOS PRIVILEGIOS Y RESTRICCIONES DEL USUARIO: ', err)
    });
  }

  ngOnDestroy(): void {
    if (this.intervaloRelojFechaHora) {
      clearInterval(this.intervaloRelojFechaHora);
    }
  }

  //CONSULTA LOS PRIVILEGIOS Y RESTRICCIONES DE ACCESO REALES DEL USUARIO LOGUEADO Y ACTUALIZA LA BANDERA
  //QUE MUESTRA U OCULTA EL ÁREA DEL LISTADO DE ÚLTIMOS MOVIMIENTOS DE PERSONAL DE ESTE DASHBOARD:
  private actualizarPrivilegiosyRestriccionesCRUD(): void {
    this.sioNoPrivilegioyRestriccionAccesoUsuarioCRUDVer = this.sessionService.tieneAcceso('ULTIMOS MOVIMIENTOS DE PERSONAL') ? 'SI' : 'NO';
  }

  //CONSULTA AL SERVICIO COMPARTIDO EL TOTAL DE ALERTAS DE SEGURIDAD (VER AlertasSeguridadService, EL MISMO
  //QUE USA ReportesSeguridadComponent PARA EL DETALLE):
  private cargarTotalAlertasSeguridad(): void {
    this.alertasSeguridadService.getSecurityAlerts().subscribe({
      next: (resultado) => {
        this.totalAlertasSeguridad =
          resultado.alertaPuestosSinCobertura.length +
          resultado.alertaPersonalInactivoConTurno.length +
          resultado.alertaTurnosVencidosSinSalida.length +
          resultado.alertaInasistencias.length +
          resultado.alertaUbicacionInactivaConTurno.length;
      },
      error: (err) => console.error('ERROR AL CALCULAR LAS ALERTAS DE SEGURIDAD: ', err)
    });
  }

  //CONSULTA EL USUARIO LOGUEADO POR ID (IGUAL QUE vista-usuario.component.ts) PARA OBTENER EL NOMBRE DE SU TIPO DE
  //USUARIO: EL ENDPOINT DE LOGIN (nicknameYPassword) NO TRAE tipoUsuarioDTO, POR ESO SE CONSULTA POR ID:
  private cargarTipoUsuarioLogueado(): void {
    const idUsuario = this.sessionService.getIdUsuario();
    if (!idUsuario) return;

    this.usuariosService.getUserbyId(idUsuario).subscribe({
      next: (respuesta) => {
        this.tipoUsuarioLogueado = String(respuesta.usuarioDTO?.tipoUsuarioDTO?.nombreTipoUsuario ?? '');

        //SI EL USUARIO CONECTADO TAMBIÉN ESTÁ REGISTRADO COMO EMPLEADO (MISMO NÚMERO DE DOCUMENTO, IGUAL QUE
        //CUANDO SE CREA UN USUARIO A PARTIR DE UN EMPLEADO EN add-upd-del-usuario.component.ts), SE CALCULA SU
        //LIQUIDACIÓN DEL AÑO EN CURSO PARA EL DASHBOARD:
        const numeroDocumentoIdentificacionUsuario = String(respuesta.usuarioDTO?.numeroDocumentoIdentificacionUsuario ?? '').trim();
        console.log('DEBUG LIQUIDACIÓN — numeroDocumentoIdentificacionUsuario: ', numeroDocumentoIdentificacionUsuario);
        if (numeroDocumentoIdentificacionUsuario) {
          this.cargarLiquidacionUsuarioConectado(numeroDocumentoIdentificacionUsuario);
        }
      },
      error: (err) => console.error('ERROR AL CONSULTAR EL TIPO DE USUARIO DEL USUARIO CONECTADO: ', err)
    });
  }

  //BUSCA UN EMPLEADO CON EL MISMO NÚMERO DE DOCUMENTO DEL USUARIO CONECTADO. SI NO EXISTE (EL USUARIO NO ES UN
  //EMPLEADO), SIMPLEMENTE NO SE MUESTRA EL BLOQUE DE LIQUIDACIÓN DEL DASHBOARD:
  private cargarLiquidacionUsuarioConectado(numeroDocumentoIdentificacionUsuario: string): void {
    this.empleadosService.getEmployeebyNumeroDocumentoIdentificacion(numeroDocumentoIdentificacionUsuario).subscribe({
      next: (respuesta) => {
        console.log('DEBUG LIQUIDACIÓN — respuesta empleado por documento: ', respuesta);
        if (respuesta.empleadoDTO) {
          this.calcularLiquidacionAnioActualEmpleadoConectado(respuesta.empleadoDTO);
        }
      },
      error: (err) => console.log('DEBUG LIQUIDACIÓN — NO SE ENCONTRÓ EMPLEADO CON ESE DOCUMENTO (o error de backend): ', err)
    });
  }

  //CALCULA, CON LA MISMA LÓGICA EXACTA QUE USA EL LISTADO COMPLETO DE LIQUIDACIONES (VER
  //liquidacion-empleado-calculo.util.ts), EL TOTAL DE HORAS LABORADAS Y EL VALOR BRUTO/NETO DEL AÑO EN CURSO
  //PARA EL EMPLEADO LIGADO AL USUARIO CONECTADO. SÓLO SE MUESTRA EL BLOQUE SI REGISTRA HORAS LABORADAS (> 0):
  private calcularLiquidacionAnioActualEmpleadoConectado(empleado: EmpleadosI): void {
    forkJoin({
      tarifas: this.tarifasEmpleadosService.findAllEmployeeRates(
        undefined, undefined,
        empleado.tipoEmpleadoDTO?.idTipoEmpleado,
        empleado.tipoEmpleadoPlantaDTO?.idTipoEmpleadoPlanta,
        empleado.clasificacionEmpleadoPlantaDTO?.idClasificacionEmpleadoPlanta,
        empleado.subclasificacionEmpleadoPlantaDTO?.idSubclasificacionEmpleadoPlanta,
        undefined, this.anioActual
      ),
      programaciones: this.programacionesTurnosEmpleadosService.findAllEmployeeShiftSchedules(),
      historial: this.historialMovimientosEmpleadosService.findAllEmployeeMovementHistories()
    }).subscribe({
      next: ({ tarifas, programaciones, historial }) => {
        console.log('DEBUG LIQUIDACIÓN — empleado: ', empleado);
        console.log('DEBUG LIQUIDACIÓN — tarifas encontradas para su perfil/año: ', tarifas);
        console.log('DEBUG LIQUIDACIÓN — total programaciones (todas): ', programaciones.length, ' total historial (todo): ', historial.length);
        if (tarifas.length === 0) return; //SIN TARIFAS REGISTRADAS PARA SU PERFIL EN EL AÑO EN CURSO.

        const ventanaDiurna = determinarVentanaDiurnaDesdeCatalogo(programaciones);
        const horasClasificadas = clasificarHorasTrabajadasPorEmpleado(Number(empleado.idEmpleado), this.anioActual, ventanaDiurna, programaciones, historial);
        console.log('DEBUG LIQUIDACIÓN — horasClasificadas: ', Object.fromEntries(horasClasificadas));

        let horasTrabajadas = 0;
        let valorBruto = 0;
        for (const tarifa of tarifas) {
          const nombreTipoTarifaEmpleado = String(tarifa.tipoTarifaEmpleadoDTO?.nombreTipoTarifaEmpleado || '').toUpperCase();
          const horas = horasClasificadas.get(nombreTipoTarifaEmpleado) || 0;
          if (horas <= 0) continue;
          horasTrabajadas += horas;
          valorBruto += horas * Number(tarifa.valorHoraTarifaEmpleado || 0);
        }
        console.log('DEBUG LIQUIDACIÓN — horasTrabajadas: ', horasTrabajadas, ' valorBruto: ', valorBruto);

        if (horasTrabajadas <= 0) return; //NO REGISTRA HORAS LABORADAS EN EL SISTEMA EN EL AÑO EN CURSO.

        this.totalHorasLaboradasUsuarioConectado = horasTrabajadas;
        this.totalValorBrutoUsuarioConectado = valorBruto;
        this.totalValorNetoUsuarioConectado = valorBruto * (1 - this.porcentajeDescuentoLiquidacion);
        this.mostrarLiquidacionUsuarioConectado = true;
      },
      error: (err) => console.error('ERROR AL CALCULAR LA LIQUIDACIÓN DEL USUARIO CONECTADO: ', err)
    });
  }

  //FORMATEA UN VALOR NUMÉRICO COMO MONEDA COLOMBIANA (IGUAL QUE liquidacion-empleados.component.ts):
  formatearMonedaLiquidacionUsuarioConectado(valor: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor);
  }

  //CONSULTA LOS DATOS DEL USUARIO LOGUEADO PARA OBTENER EL NOMBRE DEL ARCHIVO DE SU FOTO Y RESOLVER LA VISTA
  //PREVIA QUE SE MUESTRA EN EL AVATAR DEL CABEZOTE (SI NO TIENE FOTO, SE MANTIENE EL CÍRCULO CON LA INICIAL):
  cargarFotoUsuarioLogueado(): void {
    const passwordUsuarioLogueadoEncriptado = localStorage.getItem('passwordUsuarioLogueadoEncriptado');
    if (!this.nicknameUsuarioLogueado || !passwordUsuarioLogueadoEncriptado) return;

    this.usuariosService.getUserbyNicknameAndPassword(this.nicknameUsuarioLogueado, passwordUsuarioLogueadoEncriptado).subscribe({
      next: (respuesta) => {
        const nombreArchivoFoto = respuesta.usuarioDTO?.nombreArchivoFotoExtensionoFormatoUsuario;
        if (!nombreArchivoFoto) {
          //SIN FOTO ASOCIADA (O RECIÉN ELIMINADA): SE LIMPIA LA VISTA PREVIA PARA QUE EL AVATAR VUELVA A MOSTRAR LA INICIAL:
          if (this.previewUrlFotoUsuarioLogueado) URL.revokeObjectURL(this.previewUrlFotoUsuarioLogueado);
          this.previewUrlFotoUsuarioLogueado = null;
          return;
        }

        this.parametrosSistemaService.getSystemParameterbyId(1).subscribe({
          next: (respuestaParametros) => {
            const parametrosSistema = respuestaParametros.parametrosSistemaDTO;
            const rutaCompleta = String(parametrosSistema.rutaDestinoCarpetaPrincipalServidorAplicaciones)
              + String(parametrosSistema.rutaDestinoArchivosUsuarios) + String(nombreArchivoFoto);
            this.gestionArchivosService.getFile(rutaCompleta).subscribe({
              next: (respuestaArchivo) => {
                this.gestionArchivosService.getFileBytes(respuestaArchivo.rutaEstatica).subscribe({
                  next: (blob) => {
                    if (this.previewUrlFotoUsuarioLogueado) URL.revokeObjectURL(this.previewUrlFotoUsuarioLogueado);
                    this.previewUrlFotoUsuarioLogueado = URL.createObjectURL(blob);
                  },
                  error: () => { this.previewUrlFotoUsuarioLogueado = null; }
                });
              },
              error: () => { this.previewUrlFotoUsuarioLogueado = null; }
            });
          },
          error: (err) => console.error('ERROR AL OBTENER LOS PARÁMETROS DEL SISTEMA PARA LA FOTO DEL CABEZOTE: ', err)
        });
      },
      error: (err) => console.error('ERROR AL CARGAR LOS DATOS DEL USUARIO LOGUEADO PARA EL CABEZOTE: ', err)
    });
  }

  //CONSULTA AL BACKEND EL LISTADO COMPLETO DE EMPLEADOS Y DE PUESTOS DE TRABAJO Y CUENTA CUÁNTOS ESTÁN
  //ACTIVOS/INACTIVOS (EL BACKEND NO OFRECE UN FILTRO POR ESTADO, SOLO "keyword" GENÉRICO, ASÍ QUE EL CONTEO
  //SE HACE EN EL CLIENTE SOBRE EL LISTADO COMPLETO — MISMO ENFOQUE QUE listado-empleados.component.ts):
  private cargarContadoresPersonalYPuestos(): void {
    this.empleadosService.findAllEmployees().subscribe({
      next: (empleados) => {
        this.totalEmpleadosActivos = empleados.filter(e => e.estadoEmpleado === 'ACTIVO').length;
        this.totalEmpleadosInactivos = empleados.filter(e => e.estadoEmpleado === 'INACTIVO').length;
      },
      error: (err) => console.error('ERROR AL CONTAR EMPLEADOS: ', err)
    });

    this.puestosSedesEstablecimientosClientesService.findAllClientEstablishmentBranchPosts().subscribe({
      next: (puestos) => {
        this.totalPuestosActivos = puestos.filter(p => p.estadoPuestoSedeEstablecimientoCliente === 'ACTIVO').length;
        this.totalPuestosInactivos = puestos.filter(p => p.estadoPuestoSedeEstablecimientoCliente === 'INACTIVO').length;
      },
      error: (err) => console.error('ERROR AL CONTAR PUESTOS DE TRABAJO: ', err)
    });
  }

  //CONSULTA AL BACKEND LA PÁGINA ACTUAL DEL HISTORIAL DE MOVIMIENTOS (SERVICIO DE LISTAR PAGINADO), ORDENADA
  //DE LA MÁS RECIENTE A LA MÁS ANTIGUA, IGUAL QUE LOS DEMÁS LISTADOS PAGINADOS DEL SISTEMA:
  private cargarUltimosMovimientosPersonal(): void {
    this.historialMovimientosEmpleadosService.findCountTotalRegisters().subscribe({
      next: (total) => { this.totalRegistrosMovimientos = total; },
      error: (err) => console.error('ERROR AL CONTAR HISTORIAL DE MOVIMIENTOS: ', err)
    });

    this.historialMovimientosEmpleadosService.findAllEmployeeMovementHistoriesPag(
      this.paginaActualMovimientos,
      this.tandaNumeroRegistrosporPaginaMovimientos,
      undefined,
      undefined,
      'fechaHMSHistorialMovimientoEmpleado',
      'DESC'
    ).subscribe({
      next: (data) => { this.ultimosMovimientosPersonal = data; },
      error: (err) => console.error('ERROR AL CARGAR HISTORIAL DE MOVIMIENTOS: ', err)
    });
  }

  //MÉTODO USADO EN LA PLANTILLA PARA OBTENER EL ESTADO DE ACTIVIDAD DE UN MOVIMIENTO
  //(MISMA REGLA DE NEGOCIO QUE listado-empleados.component.ts: ENTRADA => EN TURNO, SALIDA => EN DESCANSO):
  obtenerEstadoActividadMovimiento(movimiento: HistorialMovimientosEmpleadosI): string {
    const nombreTipoMovimiento = String(movimiento.tipoMovimientoDTO?.nombreTipoMovimiento || '').toUpperCase();
    return nombreTipoMovimiento === 'ENTRADA' ? 'EN TURNO'
      : nombreTipoMovimiento === 'SALIDA' ? 'EN DESCANSO'
      : 'SIN REGISTROS';
  }

  //AL CLICKEAR "EN TURNO": ABRE EL MODAL CON LA UBICACIÓN DEL TURNO (ESTABLECIMIENTO → SEDE → PUESTO)
  //Y SU PERÍODO, TOMADOS DE LA PROGRAMACIÓN DEL TURNO DEL PROPIO MOVIMIENTO (MISMO MODAL QUE listado-empleados):
  abrirUbicacionTurno(movimiento: HistorialMovimientosEmpleadosI): void {
    if (this.obtenerEstadoActividadMovimiento(movimiento) !== 'EN TURNO') return;
    const programacion = movimiento.programacionTurnoEmpleadoDTO;
    const puesto = programacion?.puestoSedeEstablecimientoClienteDTO;
    if (!puesto) return;
    this.puestoEnTurno = puesto;
    this.sedeEnTurno = puesto.sedeEstablecimientoClienteDTO;
    this.establecimientoEnTurno = puesto.sedeEstablecimientoClienteDTO?.establecimientoClienteDTO;
    this.programacionEnTurno = programacion;
    this.modalUbicacionTurnoVisible = true;
  }

  //MÉTODO PARA CERRAR EL MODAL DE UBICACIÓN DEL TURNO:
  cerrarModalUbicacionTurno(): void {
    this.modalUbicacionTurnoVisible = false;
    this.establecimientoEnTurno = null;
    this.sedeEnTurno = null;
    this.puestoEnTurno = null;
    this.programacionEnTurno = null;
  }

  //MÉTODO PARA CALCULAR EL TOTAL DE PÁGINAS DE LOS ÚLTIMOS MOVIMIENTOS:
  calcularTotalPaginasMovimientos(): number {
    const total = Math.ceil(this.totalRegistrosMovimientos / this.tandaNumeroRegistrosporPaginaMovimientos);
    return total > 0 ? total : 1;
  }

  //MÉTODO PARA CAMBIAR DE PÁGINA EN LOS ÚLTIMOS MOVIMIENTOS:
  cambiarPaginaMovimientos(pagina: number): void {
    this.paginaActualMovimientos = pagina;
    this.cargarUltimosMovimientosPersonal();
  }

  //MÉTODO PARA SELECCIONAR LA TANDA DE REGISTROS POR PÁGINA DE LOS ÚLTIMOS MOVIMIENTOS:
  seleccionarTandaNumeroRegistrosporPaginaMovimientos(valor: string): void {
    this.tandaNumeroRegistrosporPaginaMovimientos = Number(valor);
    this.paginaActualMovimientos = 0;
    this.cargarUltimosMovimientosPersonal();
  }

  // Cambia la sección activa y refleja el cambio en la URL sin navegar.
  setMenuActivo(seccion: string): void {
    this.menuPrincipalActivo = seccion;
    const url = seccion === 'inicio' ? '/inicio' : `/${seccion}`;
    this.location.replaceState(url);
    this.sidebarMobileAbierto = false;
  }

  toggleSidebarMobile(): void {
    this.sidebarMobileAbierto = !this.sidebarMobileAbierto;
  }

  cerrarSidebarMobile(): void {
    this.sidebarMobileAbierto = false;
  }

  navegarA(ruta: string, funcionalidad: string, rol: string): void {
    this.sessionService.setContextoFuncionalidadAndRol(funcionalidad, rol);
    this.router.navigate([ruta]);
  }

  cerrarSesion(): void {
    this.sessionService.clearSession();
    this.router.navigate(['/']);
  }

  get inicialUsuario(): string {
    const nombre = this.nombreUsuarioLogueado || this.nicknameUsuarioLogueado;
    return nombre ? nombre[0].toUpperCase() : 'U';
  }
}
