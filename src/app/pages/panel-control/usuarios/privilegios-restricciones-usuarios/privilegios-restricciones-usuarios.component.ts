//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';

//IMPORTACIÓN DE INTERFACES:
import { UsuariosI } from '../../../../interfaces/panel-control/usuarios/usuarios.interface';
import { FuncionalidadesI } from '../../../../interfaces/panel-control/usuarios/funcionalidades/funcionalidades.interface';
import { RolesI } from '../../../../interfaces/panel-control/usuarios/funcionalidades/roles/roles.interface';
import { PrivilegyRestriccAccesosUsuariosI, PrivilegyRestriccAccesosUsuariosMsj } from '../../../../interfaces/panel-control/usuarios/privileg-y-restricc-accesos-usuarios/privileg-y-restricc-accesos-usuarios.interface';

//IMPORTACIÓN DE SERVICIOS:
import { FuncionalidadesService } from '../../../../services/panel-control/usuarios/funcionalidades/funcionalidades.service';
import { RolesService } from '../../../../services/panel-control/usuarios/funcionalidades/roles/roles.service';
import { PrivilegyRestriccAccesosUsuariosService } from '../../../../services/panel-control/usuarios/privileg-y-restricc-accesos-usuarios/privileg-y-restricc-accesos-usuarios.service';
import { AuditoriasSistemaService } from '../../../../services/panel-control/auditorias-sistema/auditorias-sistema.service';

//AGRUPACIÓN DE UNA FUNCIONALIDAD CON SUS ROLES PARA EL RENDERIZADO DE LA TABLA:
interface FuncionalidadConRolesI {
  funcionalidad: FuncionalidadesI;
  roles: RolesI[];
}

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-privilegios-restricciones-usuarios',
  templateUrl: './privilegios-restricciones-usuarios.component.html',
  styleUrls: ['./privilegios-restricciones-usuarios.component.scss']
})
export class PrivilegiosyRestriccionesUsuariosComponent implements OnInit {

  //INPUTS: DATOS DEL USUARIO:
  @Input() usuarioData: UsuariosI | null = null;

  //OUTPUTS: EVENTOS PARA EL COMPONENTE PADRE:
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() toastEvento = new EventEmitter<{ tipo: string; mensaje: string }>();

  //DECLARACIÓN DE VARIABLES GLOBALES:
  privilegiosyRestriccForm!: FormGroup;
  cargandoDatos: boolean = false;
  guardandoDatos: boolean = false;
  mensajeError: string = '';

  //DATOS TRAÍDOS DEL BACKEND:
  funcionalidades: FuncionalidadesI[] = [];
  roles: RolesI[] = [];
  funcionalidadesConRoles: FuncionalidadConRolesI[] = [];
  private privilegiosExistentes: PrivilegyRestriccAccesosUsuariosI[] = [];

  //NOMBRE FIJO DEL CONTROL MAESTRO DE "SELECCIONAR TODOS":
  private readonly CONTROL_SELECCIONAR_TODOS = 'checkboxSeleccionarTodasFuncionalidadesyRoles';

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(
    private formBuilder: FormBuilder,
    private funcionalidadesService: FuncionalidadesService,
    private rolesService: RolesService,
    private privilegyRestriccAccesosUsuariosService: PrivilegyRestriccAccesosUsuariosService,
    private auditoriasSistemaService: AuditoriasSistemaService
  ) {}

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  //NOMBRE DEL FORMCONTROL ASOCIADO A UN ROL, IDENTIFICADO POR SU ID (ÚNICO Y ESTABLE):
  obtenerNombreControl(idRol: number | undefined): string {
    return 'rol_' + idRol;
  }

  //CARGA FUNCIONALIDADES, ROLES Y LOS PRIVILEGIOS Y RESTRICCIONES YA OTORGADOS AL USUARIO, TODO DESDE EL BACKEND:
  private cargarDatosIniciales(): void {
    if (!this.usuarioData?.idUsuario) {
      this.mensajeError = 'No se encontró el usuario seleccionado.';
      return;
    }
    this.cargandoDatos = true;
    this.mensajeError = '';

    forkJoin({
      funcionalidades: this.funcionalidadesService.findAllFunctionalities(undefined, undefined, 'idFuncionalidad', 'ASC'),
      roles: this.rolesService.findAllRoles(undefined, undefined, undefined, 'idRol', 'ASC'),
      privilegios: this.privilegyRestriccAccesosUsuariosService.findAllPrivilegesAndRestrictionsAccessUsers(
        undefined, undefined, undefined, undefined, undefined, undefined, this.usuarioData.idUsuario
      )
    }).subscribe({
      next: ({ funcionalidades, roles, privilegios }) => {
        this.funcionalidades = funcionalidades;
        this.roles = roles;
        this.privilegiosExistentes = privilegios;
        this.construirAgrupacionFuncionalidadesConRoles();
        this.initForm();
        this.cargandoDatos = false;
      },
      error: (err) => {
        console.error('ERROR AL CARGAR FUNCIONALIDADES, ROLES Y PRIVILEGIOS Y RESTRICCIONES: ', err);
        this.mensajeError = 'Error al cargar los datos. Verifique la conexión con el servidor.';
        this.cargandoDatos = false;
      }
    });
  }

  //AGRUPA LOS ROLES POR SU FUNCIONALIDAD, RESPETANDO EL ORDEN DE LLEGADA DE LAS FUNCIONALIDADES:
  private construirAgrupacionFuncionalidadesConRoles(): void {
    this.funcionalidadesConRoles = this.funcionalidades.map(funcionalidad => ({
      funcionalidad,
      roles: this.roles.filter(rol => rol.funcionalidadDTO?.idFuncionalidad === funcionalidad.idFuncionalidad)
    })).filter(grupo => grupo.roles.length > 0);
  }

  //MÉTODO DE INICIALIZACIÓN DEL FORMULARIO CON UN CHECKBOX POR CADA ROL, MÁS EL CHECKBOX MAESTRO:
  private initForm(): void {
    const idsRolesExistentes = new Set(this.privilegiosExistentes.map(privilegyRestricc => privilegyRestricc.rolDTO?.idRol));
    const controls: any = {};
    this.roles.forEach(rol => {
      controls[this.obtenerNombreControl(rol.idRol)] = [idsRolesExistentes.has(rol.idRol)];
    });
    controls[this.CONTROL_SELECCIONAR_TODOS] = [this.roles.length > 0 && this.roles.every(rol => idsRolesExistentes.has(rol.idRol))];
    this.privilegiosyRestriccForm = this.formBuilder.group(controls);

    //EL USUARIO SUPER ADMINISTRADOR DEL SISTEMA (idUsuario === 1) NUNCA DEBE QUEDAR SIN ACCESO: SE DESHABILITA
    //TODO EL FORMULARIO (NINGÚN CHECKBOX DE PRIVILEGIO SE PUEDE MARCAR NI DESMARCAR PARA ESTE USUARIO):
    if (this.esSuperAdministrador) {
      this.privilegiosyRestriccForm.disable();
    }
  }

  //INDICA SI EL USUARIO AL QUE SE LE ESTÁN ASIGNANDO PRIVILEGIOS Y RESTRICCIONES ES EL SUPER ADMINISTRADOR DEL
  //SISTEMA (idUsuario === 1), PARA GARANTIZAR QUE SIEMPRE CONSERVE EL ACCESO COMPLETO AL SISTEMA:
  get esSuperAdministrador(): boolean {
    return this.usuarioData?.idUsuario === 1;
  }

  //MARCA O DESMARCA TODOS LOS CHECKBOX DE ROLES AL CAMBIAR EL CHECKBOX MAESTRO:
  onCambioSeleccionarTodos(): void {
    const nuevoEstado = !!this.privilegiosyRestriccForm.get(this.CONTROL_SELECCIONAR_TODOS)?.value;
    this.roles.forEach(rol => {
      this.privilegiosyRestriccForm.get(this.obtenerNombreControl(rol.idRol))?.setValue(nuevoEstado, { emitEvent: false });
    });
  }

  //RECALCULA EL ESTADO DEL CHECKBOX MAESTRO CUANDO SE CAMBIA UN CHECKBOX DE ROL INDIVIDUAL:
  onCambioRolIndividual(): void {
    const todosMarcados = this.roles.every(rol => !!this.privilegiosyRestriccForm.get(this.obtenerNombreControl(rol.idRol))?.value);
    this.privilegiosyRestriccForm.get(this.CONTROL_SELECCIONAR_TODOS)?.setValue(todosMarcados, { emitEvent: false });
  }

  //DEVUELVE EL CONJUNTO DE IDS DE ROL ACTUALMENTE MARCADOS EN EL FORMULARIO:
  private obtenerIdsRolesChequeados(): Set<number | undefined> {
    const fv = this.privilegiosyRestriccForm.getRawValue();
    return new Set(
      this.roles.filter(rol => !!fv[this.obtenerNombreControl(rol.idRol)]).map(rol => rol.idRol)
    );
  }

  //DEVUELVE LA FECHA Y HORA LOCAL ACTUAL EN FORMATO ISO-8601 CON MILISEGUNDOS Y OFFSET DE ZONA HORARIA
  //(MISMO FORMATO EXIGIDO POR EL BACKEND PARA CAMPOS java.util.Date — VER AuditoriasSistemaService):
  private obtenerFechaHoraLocalActual(): string {
    const ahora = new Date();
    const dosDigitos = (valor: number): string => String(valor).padStart(2, '0');
    const fecha = `${ahora.getFullYear()}-${dosDigitos(ahora.getMonth() + 1)}-${dosDigitos(ahora.getDate())}`;
    const hora = `${dosDigitos(ahora.getHours())}:${dosDigitos(ahora.getMinutes())}:${dosDigitos(ahora.getSeconds())}`;
    const milisegundos = String(ahora.getMilliseconds()).padStart(3, '0');
    const offsetMinutosTotal = -ahora.getTimezoneOffset();
    const signoOffset = offsetMinutosTotal >= 0 ? '+' : '-';
    const offsetHoras = dosDigitos(Math.floor(Math.abs(offsetMinutosTotal) / 60));
    const offsetMinutos = dosDigitos(Math.abs(offsetMinutosTotal) % 60);
    return `${fecha}T${hora}.${milisegundos}${signoOffset}${offsetHoras}:${offsetMinutos}`;
  }

  //ACCIÓN GUARDAR: CALCULA QUÉ ROLES SE DEBEN CREAR (RECIÉN MARCADOS) Y CUÁLES SE DEBEN ELIMINAR (RECIÉN
  //DESMARCADOS Y QUE YA EXISTÍAN), Y APLICA LOS CAMBIOS DE FORMA MASIVA EN EL BACKEND:
  accionGuardarPrivilegios(): void {
    if (!this.usuarioData?.idUsuario || this.guardandoDatos || this.esSuperAdministrador) return;
    const idUsuario = this.usuarioData.idUsuario;

    const idsRolesChequeados = this.obtenerIdsRolesChequeados();
    const idsRolesExistentes = new Set(this.privilegiosExistentes.map(privilegyRestricc => privilegyRestricc.rolDTO?.idRol));

    //ROLES RECIÉN MARCADOS QUE AÚN NO TIENEN PRIVILEGIO Y RESTRICCIÓN GUARDADO:
    const rolesParaCrear = this.roles.filter(rol => idsRolesChequeados.has(rol.idRol) && !idsRolesExistentes.has(rol.idRol));

    //PRIVILEGIOS Y RESTRICCIONES YA EXISTENTES CUYO ROL FUE DESMARCADO:
    const privilegiosParaEliminar = this.privilegiosExistentes.filter(privilegyRestricc => !idsRolesChequeados.has(privilegyRestricc.rolDTO?.idRol));

    if (rolesParaCrear.length === 0 && privilegiosParaEliminar.length === 0) {
      this.closeModal();
      return;
    }

    this.guardandoDatos = true;
    this.mensajeError = '';

    //CASO ESPECIAL: SE DESMARCARON TODOS LOS ROLES (CHECKBOX MAESTRO EN "NO") — ELIMINACIÓN MASIVA POR USUARIO:
    if (idsRolesChequeados.size === 0 && this.privilegiosExistentes.length > 0) {
      this.privilegyRestriccAccesosUsuariosService.deletePrivilegesAndRestrictionsAccessUsersbyIdUsuario(idUsuario).subscribe({
        next: (resp: PrivilegyRestriccAccesosUsuariosMsj) => {
          this.auditoriasSistemaService.registerSystemAudit(
            'ELIMINAR PRIVILEGIOS Y RESTRICCIONES DE USUARIOS',
            `Se eliminaron todos los privilegios y restricciones (${this.privilegiosExistentes.length}) del usuario ${this.usuarioData?.nicknameUsuario}.`
          );
          this.guardandoDatos = false;
          this.toastEvento.emit({ tipo: 'exito', mensaje: resp.mensaje || 'Privilegios y restricciones eliminados con éxito.' });
          this.closeModal();
        },
        error: (err) => {
          console.error('ERROR AL ELIMINAR MASIVAMENTE LOS PRIVILEGIOS Y RESTRICCIONES: ', err);
          this.guardandoDatos = false;
          this.toastEvento.emit({ tipo: 'error', mensaje: 'Error al eliminar los privilegios. Intente nuevamente.' });
        }
      });
      return;
    }

    //CASO GENERAL: INSERCIÓN MASIVA DE LOS NUEVOS Y ELIMINACIÓN (EN PARALELO) DE LOS DESMARCADOS:
    const fechaHMSActual = this.obtenerFechaHoraLocalActual();
    const peticiones: { [clave: string]: Observable<any> } = {};

    if (rolesParaCrear.length > 0) {
      const nuevosPrivilegios: PrivilegyRestriccAccesosUsuariosI[] = rolesParaCrear.map(rol => ({
        usuarioDTO: this.usuarioData!,
        funcionalidadDTO: rol.funcionalidadDTO,
        rolDTO: rol,
        urlAccesoUsuario: '',
        sioNoPrivilegyRestriccAccesoUsuario: 'SI',
        fechaHMSIngresoPrivilegyRestriccAccesoUsuario: fechaHMSActual
      }));
      peticiones['creacion'] = this.privilegyRestriccAccesosUsuariosService.addPrivilegesAndRestrictionsAccessUsers(nuevosPrivilegios);
    }

    if (privilegiosParaEliminar.length > 0) {
      peticiones['eliminacion'] = forkJoin(
        privilegiosParaEliminar.map(privilegyRestricc =>
          this.privilegyRestriccAccesosUsuariosService.deletePrivilegeAndRestrictionAccessUser(privilegyRestricc.idPrivilegyRestriccAccesoUsuario!)
        )
      );
    }

    forkJoin(peticiones).subscribe({
      next: () => {
        const descripcionCambios: string[] = [];
        if (rolesParaCrear.length > 0) descripcionCambios.push(`${rolesParaCrear.length} otorgado(s)`);
        if (privilegiosParaEliminar.length > 0) descripcionCambios.push(`${privilegiosParaEliminar.length} revocado(s)`);
        this.auditoriasSistemaService.registerSystemAudit(
          'MODIFICAR PRIVILEGIOS Y RESTRICCIONES DE USUARIOS',
          `Se actualizaron los privilegios y restricciones del usuario ${this.usuarioData?.nicknameUsuario}: ${descripcionCambios.join(', ')}.`
        );
        this.guardandoDatos = false;
        this.toastEvento.emit({ tipo: 'exito', mensaje: 'Privilegios y restricciones actualizados con éxito.' });
        this.closeModal();
      },
      error: (err) => {
        console.error('ERROR AL ACTUALIZAR LOS PRIVILEGIOS Y RESTRICCIONES: ', err);
        this.guardandoDatos = false;
        this.toastEvento.emit({ tipo: 'error', mensaje: 'Error al actualizar los privilegios. Intente nuevamente.' });
      }
    });
  }

  //CIERRA EL MODAL:
  closeModal(): void {
    this.cerrarModal.emit();
  }
}
