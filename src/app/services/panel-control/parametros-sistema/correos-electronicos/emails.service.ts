import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EmailsI, EmailsMsj } from '../../../../interfaces/panel-control/parametros-sistema/correos-electronicos/emails.interface';

@Injectable({
  providedIn: 'root'
})
export class EmailsService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  //ENVIAR CORREO ELECTRÓNICO.
  sendEmail(email: EmailsI): Observable<EmailsMsj> {
    return this.http.post<EmailsMsj>(`${this.baseUrl}/emails`, email);
  }

}
