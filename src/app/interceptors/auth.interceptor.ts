//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SessionService } from '../services/session/session.service';

//INTERCEPTOR QUE ADJUNTA EL TOKEN DE AUTORIZACIÓN EN LA CABECERA DE CADA PETICIÓN HTTP Y CIERRA LA SESIÓN
//AUTOMÁTICAMENTE CUANDO EL BACKEND RESPONDE QUE EL TOKEN YA NO ES VÁLIDO (EXPIRADO):
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private sessionService: SessionService) {}

  //MÉTODO QUE INTERCEPTA CADA PETICIÓN HTTP Y AGREGA EL TOKEN DE AUTORIZACIÓN EN LA CABECERA:
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    //SE OBTIENE EL TOKEN DE AUTORIZACIÓN DE LA VARIABLE DE SESIÓN (LOCALSTORAGE):
    const tokenAutorizacion = this.sessionService.getToken();

    //SI EL TOKEN DE AUTORIZACIÓN EXISTE, SE CLONA LA PETICIÓN Y SE AGREGA EL TOKEN EN LA CABECERA CON EL PREFIJO BEARER:
    const peticionConToken = tokenAutorizacion
      ? req.clone({ setHeaders: { Authorization: `Bearer ${tokenAutorizacion}` } })
      : req;

    return next.handle(peticionConToken).pipe(
      catchError((error: HttpErrorResponse) => {
        //SI EL BACKEND RESPONDE 401 (TOKEN EXPIRADO O INVÁLIDO) Y HABÍA UNA SESIÓN ACTIVA, SE LIMPIA LA SESIÓN Y
        //SE RECARGA LA APLICACIÓN PARA QUE EL USUARIO VUELVA AL LOGIN. SE EXCLUYE LA PETICIÓN DE /login PARA NO
        //DISPARAR ESTO CUANDO EL 401 ES POR CREDENCIALES INCORRECTAS AL INTENTAR INICIAR SESIÓN:
        const esPeticionDeLogin = req.url.includes('/login');
        if (error.status === 401 && tokenAutorizacion && !esPeticionDeLogin) {
          this.sessionService.clearSession();
          window.location.reload();
        }
        return throwError(() => error);
      })
    );
  }
}
