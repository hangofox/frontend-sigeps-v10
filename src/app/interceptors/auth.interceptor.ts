//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

//INTERCEPTOR QUE ADJUNTA EL TOKEN DE AUTORIZACIÓN EN LA CABECERA DE CADA PETICIÓN HTTP:
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  //MÉTODO QUE INTERCEPTA CADA PETICIÓN HTTP Y AGREGA EL TOKEN DE AUTORIZACIÓN EN LA CABECERA:
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    //SE OBTIENE EL TOKEN DE AUTORIZACIÓN DE LA VARIABLE DE SESIÓN (LOCALSTORAGE):
    const tokenAutorizacion = localStorage.getItem('tokenAutorizacion');

    //SI EL TOKEN DE AUTORIZACIÓN EXISTE, SE CLONA LA PETICIÓN Y SE AGREGA EL TOKEN EN LA CABECERA CON EL PREFIJO BEARER:
    if (tokenAutorizacion) {
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${tokenAutorizacion}`
        }
      });
      return next.handle(clonedRequest);
    }

    //SI EL TOKEN DE AUTORIZACIÓN NO EXISTE, SE PASA LA PETICIÓN SIN MODIFICAR:
    return next.handle(req);
  }
}
