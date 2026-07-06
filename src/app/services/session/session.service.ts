import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { PrivilegyRestriccAccesosUsuariosI } from '../../interfaces/panel-control/usuarios/privileg-y-restricc-accesos-usuarios/privileg-y-restricc-accesos-usuarios.interface';
import { PrivilegyRestriccAccesosUsuariosService } from '../panel-control/usuarios/privileg-y-restricc-accesos-usuarios/privileg-y-restricc-accesos-usuarios.service';

@Injectable({ providedIn: 'root' })
export class SessionService {

  //CACHÉ EN MEMORIA DE TODOS LOS PRIVILEGIOS Y RESTRICCIONES DE ACCESO DEL USUARIO LOGUEADO. SE CARGA UNA ÚNICA
  //VEZ POR SESIÓN (VER cargarPrivilegios) PARA QUE EL MENÚ Y LOS BOTONES DE CADA CRUD PUEDAN CONSULTARLA DE FORMA
  //SÍNCRONA (tieneAcceso/obtenerLabelFuncionalidad) SIN NECESIDAD DE LLAMADAS ADICIONALES AL BACKEND:
  private privilegios: PrivilegyRestriccAccesosUsuariosI[] = [];

  constructor(private privilegyRestriccAccesosUsuariosService: PrivilegyRestriccAccesosUsuariosService) {}

  //CARGA (O RECARGA) DESDE EL BACKEND TODOS LOS PRIVILEGIOS Y RESTRICCIONES DE ACCESO DEL USUARIO LOGUEADO ACTUAL:
  cargarPrivilegios(): Observable<PrivilegyRestriccAccesosUsuariosI[]> {
    return this.privilegyRestriccAccesosUsuariosService.findAllPrivilegesAndRestrictionsAccessUsers(
      undefined, undefined, undefined, undefined, undefined, undefined, this.getIdUsuario()
    ).pipe(
      tap(privilegios => { this.privilegios = privilegios; })
    );
  }

  //INDICA SI EL USUARIO LOGUEADO TIENE ACCESO ('SI') A UN ROL ESPECÍFICO (LOS 65 NOMBRES DE ROL DE tabla_roles SON
  //ÚNICOS, POR LO QUE BASTA CON EL NOMBRE DEL ROL PARA IDENTIFICARLO SIN AMBIGÜEDAD). SE USA PARA MOSTRAR U OCULTAR
  //OPCIONES DEL MENÚ PRINCIPAL Y BOTONES DE LOS CRUDS (VER/GUARDAR/MODIFICAR/ELIMINAR):
  tieneAcceso(nombreRol: string): boolean {
    return this.privilegios.some(privilegyRestricc =>
      String(privilegyRestricc.rolDTO?.nombreRol) === nombreRol &&
      String(privilegyRestricc.sioNoPrivilegyRestriccAccesoUsuario).toUpperCase() === 'SI'
    );
  }

  //DEVUELVE EL LABEL DEL MENÚ PRINCIPAL ALMACENADO EN BD (labelMenuPrincipalFuncionalidad) DE LA FUNCIONALIDAD
  //ASOCIADA A UN ROL; SI NO SE ENCUENTRA (EL USUARIO NO TIENE ESE PRIVILEGIO Y RESTRICCIÓN), DEVUELVE EL NOMBRE DE ROL COMO RESPALDO:
  obtenerLabelFuncionalidad(nombreRol: string): string {
    const privilegyRestriccEncontrado = this.privilegios.find(privilegyRestricc => String(privilegyRestricc.rolDTO?.nombreRol) === nombreRol);
    return privilegyRestriccEncontrado ? String(privilegyRestriccEncontrado.funcionalidadDTO?.labelMenuPrincipalFuncionalidad) : nombreRol;
  }

  setContextoFuncionalidadAndRol(nombreFuncionalidad: string, nombreRol: string): void {
    localStorage.setItem('nombreFuncionalidad', nombreFuncionalidad);
    localStorage.setItem('nombreRol', nombreRol);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  getToken(): string | null {
    return localStorage.getItem('tokenAutorizacion');
  }

  getIdUsuario(): number {
    return Number(localStorage.getItem('idUsuario'));
  }

  getNombreFuncionalidad(): string {
    return localStorage.getItem('nombreFuncionalidad') || '';
  }

  getNombreRol(): string {
    return localStorage.getItem('nombreRol') || '';
  }

  clearSession(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.privilegios = [];
  }
}
