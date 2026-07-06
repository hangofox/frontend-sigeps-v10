import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';

import { IndexComponent } from './pages/index/index.component';
import { InicioComponent } from './pages/inicio/inicio.component';
import { SeguimientoOlvidoContrasenaComponent } from './pages/seguimiento-olvido-contrasena/seguimiento-olvido-contrasena.component';
import { RecuperacionContrasenaAccesoUsuarioComponent } from './pages/recuperacion-contrasena-acceso-usuario/recuperacion-contrasena-acceso-usuario.component';
import { ErrorPageComponent } from './shared/error-page/error-page.component';
import { AuthGuardRoute } from './authguardsroute/auth-guard-route.guard';

const routes: Routes = [
  { path: '', component: IndexComponent },
  { path: 'inicio', component: InicioComponent, canActivate: [AuthGuardRoute] },
  { path: 'seguimiento-olvido-contrasena', component: SeguimientoOlvidoContrasenaComponent },
  { path: 'recuperacion-contrasena-acceso-usuario', component: RecuperacionContrasenaAccesoUsuarioComponent },
  { path: '404', component: ErrorPageComponent },
  { path: '**', redirectTo: '404' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
