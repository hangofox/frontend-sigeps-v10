import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AuthInterceptor } from './interceptors/auth.interceptor';

import { LoginComponent } from './pages/login/login.component';
import { CabezoteComponent } from './pages/cabezote/cabezote.component';
import { PiePaginaComponent } from './pages/pie-pagina/pie-pagina.component';
import { ErrorPageComponent } from './shared/error-page/error-page.component';
import { InicioComponent } from './pages/inicio/inicio.component';
import { IndexComponent } from './pages/index/index.component';
import { MenuPrincipalLateralIzquierdoComponent } from './pages/menu-principal-lateral-izquierdo/menu-principal-lateral-izquierdo.component';
import { SeguimientoOlvidoContrasenaComponent } from './pages/seguimiento-olvido-contrasena/seguimiento-olvido-contrasena.component';
import { RecuperacionContrasenaAccesoUsuarioComponent } from './pages/recuperacion-contrasena-acceso-usuario/recuperacion-contrasena-acceso-usuario.component';

//COMPONENTES DE GESTIÓN DE ESTABLECIMIENTOS CLIENTES:
import { ListadoEstablecimientosClientesComponent } from './pages/panel-control/gestion-establecimientos-clientes/listado-establecimientos-clientes/listado-establecimientos-clientes.component';
import { AddUpdDelEstablecimientoClienteComponent } from './pages/panel-control/gestion-establecimientos-clientes/add-upd-del-establecimiento-cliente/add-upd-del-establecimiento-cliente.component';
import { VistaEstablecimientoClienteComponent } from './pages/panel-control/gestion-establecimientos-clientes/vista-establecimiento-cliente/vista-establecimiento-cliente.component';
import { ListadoSedesEstablecClientesComponent } from './pages/panel-control/gestion-establecimientos-clientes/sedes-establecimientos-clientes/listado-sedes-establec-clientes/listado-sedes-establec-clientes.component';
import { AddUpdDelSedeEstablecClienteComponent } from './pages/panel-control/gestion-establecimientos-clientes/sedes-establecimientos-clientes/add-upd-del-sede-establec-cliente/add-upd-del-sede-establec-cliente.component';
import { VistaSedeEstablecClienteComponent } from './pages/panel-control/gestion-establecimientos-clientes/sedes-establecimientos-clientes/vista-sede-establec-cliente/vista-sede-establec-cliente.component';
import { ListadoPuestosSedesEstablecClientesComponent } from './pages/panel-control/gestion-establecimientos-clientes/sedes-establecimientos-clientes/puestos-sedes-establec-cliente/listado-puestos-sedes-establec-clientes/listado-puestos-sedes-establec-clientes.component';
import { AddUpdDelPuestoSedeEstablecClienteComponent } from './pages/panel-control/gestion-establecimientos-clientes/sedes-establecimientos-clientes/puestos-sedes-establec-cliente/add-upd-del-puesto-sede-establec-cliente/add-upd-del-puesto-sede-establec-cliente.component';
import { VistaPuestoSedeEstablecClienteComponent } from './pages/panel-control/gestion-establecimientos-clientes/sedes-establecimientos-clientes/puestos-sedes-establec-cliente/vista-puesto-sede-establec-cliente/vista-puesto-sede-establec-cliente.component';

//COMPONENTES DEL PANEL DE CONTROL:
import { CreditosComponent } from './pages/panel-control/creditos/creditos.component';
import { MiPerfilComponent } from './pages/panel-control/mi-perfil/mi-perfil.component';
import { ParametrosSistemaComponent } from './pages/panel-control/parametros-sistema/parametros-sistema.component';
import { ListadoUsuariosComponent } from './pages/panel-control/usuarios/listado-usuarios/listado-usuarios.component';
import { AddUpdDelUsuarioComponent } from './pages/panel-control/usuarios/add-upd-del-usuario/add-upd-del-usuario.component';
import { VistaUsuarioComponent } from './pages/panel-control/usuarios/vista-usuario/vista-usuario.component';
import { PrivilegiosyRestriccionesUsuariosComponent } from './pages/panel-control/usuarios/privilegios-restricciones-usuarios/privilegios-restricciones-usuarios.component';
import { ListadoTurnosComponent } from './pages/panel-control/turnos/listado-turnos/listado-turnos.component';
import { AddUpdDelTurnoComponent } from './pages/panel-control/turnos/add-upd-del-turno/add-upd-del-turno.component';
import { VistaTurnoComponent } from './pages/panel-control/turnos/vista-turno/vista-turno.component';
//COMPONENTES DE AUDITORÍAS DEL SISTEMA:
import { ListadoAuditoriasSistemaComponent } from './pages/panel-control/auditorias-sistema/listado-auditorias-sistema/listado-auditorias-sistema.component';
import { AddUpdDelAuditoriaSistemaComponent } from './pages/panel-control/auditorias-sistema/add-upd-del-auditoria-sistema/add-upd-del-auditoria-sistema.component';
import { VistaAuditoriaSistemaComponent } from './pages/panel-control/auditorias-sistema/vista-auditoria-sistema/vista-auditoria-sistema.component';

//COMPONENTES DE GESTIÓN DE PERSONAL:
import { ListadoEmpleadosComponent } from './pages/gestion-personal/listado-empleados/listado-empleados.component';
import { AddUpdDelEmpleadoComponent } from './pages/gestion-personal/add-upd-del-empleado/add-upd-del-empleado.component';
import { VistaEmpleadoComponent } from './pages/gestion-personal/vista-empleado/vista-empleado.component';
import { LiquidacionEmpleadosComponent } from './pages/gestion-personal/liquidacion-empleados/liquidacion-empleados.component';
import { ListadoHistorialMovimientosEmpleadosComponent } from './pages/gestion-personal/historial-movimientos-empleados/listado-historial-movimientos-empleados/listado-historial-movimientos-empleados.component';
import { AddUpdDelHistorialMovimientoEmpleadoComponent } from './pages/gestion-personal/historial-movimientos-empleados/add-upd-del-historial-movimiento-empleado/add-upd-del-historial-movimiento-empleado.component';
import { VistaHistorialMovimientoEmpleadoComponent } from './pages/gestion-personal/historial-movimientos-empleados/vista-historial-movimiento-empleado/vista-historial-movimiento-empleado.component';
import { ListadoHistorialNovedadesEmpleadosComponent } from './pages/gestion-personal/historial-novedades-empleados/listado-historial-novedades-empleados/listado-historial-novedades-empleados.component';
import { AddUpdDelHistorialNovedadEmpleadoComponent } from './pages/gestion-personal/historial-novedades-empleados/add-upd-del-historial-novedad-empleado/add-upd-del-historial-novedad-empleado.component';
import { VistaHistorialNovedadEmpleadoComponent } from './pages/gestion-personal/historial-novedades-empleados/vista-historial-novedad-empleado/vista-historial-novedad-empleado.component';
//COMPONENTES DE PROGRAMACIONES DE TURNOS DE EMPLEADOS:
import { ListadoProgTurnosEmpleadosComponent } from './pages/gestion-personal/programaciones-turnos-empleados/listado-prog-turnos-empleados/listado-prog-turnos-empleados.component';
import { AddUpdDelProgTurnoEmpleadoComponent } from './pages/gestion-personal/programaciones-turnos-empleados/add-upd-del-prog-turno-empleado/add-upd-del-prog-turno-empleado.component';
import { VistaProgTurnoEmpleadoComponent } from './pages/gestion-personal/programaciones-turnos-empleados/vista-prog-turno-empleado/vista-prog-turno-empleado.component';

//COMPONENTES DE REPORTES Y ESTADÍSTICAS:
import { ReportesComponent } from './pages/reportes-estadisticas/reportes/reportes.component';
import { GraficasEstadisticasComponent } from './pages/reportes-estadisticas/graficas-estadisticas/graficas-estadisticas.component';

//COMPONENTE DE REPORTES DE SEGURIDAD:
import { ReportesSeguridadComponent } from './pages/reportes-seguridad/reportes-seguridad.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CabezoteComponent,
    PiePaginaComponent,
    ErrorPageComponent,
    InicioComponent,
    IndexComponent,
    MenuPrincipalLateralIzquierdoComponent,
    SeguimientoOlvidoContrasenaComponent,
    RecuperacionContrasenaAccesoUsuarioComponent,
    //GESTIÓN DE ESTABLECIMIENTOS CLIENTES:
    ListadoEstablecimientosClientesComponent,
    AddUpdDelEstablecimientoClienteComponent,
    VistaEstablecimientoClienteComponent,
    ListadoSedesEstablecClientesComponent,
    AddUpdDelSedeEstablecClienteComponent,
    VistaSedeEstablecClienteComponent,
    ListadoPuestosSedesEstablecClientesComponent,
    AddUpdDelPuestoSedeEstablecClienteComponent,
    VistaPuestoSedeEstablecClienteComponent,
    //PANEL DE CONTROL:
    CreditosComponent,
    MiPerfilComponent,
    ParametrosSistemaComponent,
    ListadoUsuariosComponent,
    AddUpdDelUsuarioComponent,
    VistaUsuarioComponent,
    PrivilegiosyRestriccionesUsuariosComponent,
    ListadoTurnosComponent,
    AddUpdDelTurnoComponent,
    VistaTurnoComponent,
    //AUDITORÍAS:
    ListadoAuditoriasSistemaComponent,
    AddUpdDelAuditoriaSistemaComponent,
    VistaAuditoriaSistemaComponent,
    //GESTIÓN DE PERSONAL:
    ListadoEmpleadosComponent,
    AddUpdDelEmpleadoComponent,
    VistaEmpleadoComponent,
    LiquidacionEmpleadosComponent,
    ListadoHistorialMovimientosEmpleadosComponent,
    AddUpdDelHistorialMovimientoEmpleadoComponent,
    VistaHistorialMovimientoEmpleadoComponent,
    ListadoHistorialNovedadesEmpleadosComponent,
    AddUpdDelHistorialNovedadEmpleadoComponent,
    VistaHistorialNovedadEmpleadoComponent,
    //PROGRAMACIONES DE TURNOS DE EMPLEADOS:
    ListadoProgTurnosEmpleadosComponent,
    AddUpdDelProgTurnoEmpleadoComponent,
    VistaProgTurnoEmpleadoComponent,
    //REPORTES Y ESTADÍSTICAS:
    ReportesComponent,
    GraficasEstadisticasComponent,
    //REPORTES DE SEGURIDAD:
    ReportesSeguridadComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
