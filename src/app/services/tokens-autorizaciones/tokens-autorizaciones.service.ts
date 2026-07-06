import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginCredencialesI } from '../../interfaces/login-credenciales/login-credenciales.interface';
import { ResponseTokenAutorizacionI } from '../../interfaces/tokens-autorizaciones/tokens-autorizaciones.interface';

@Injectable({ providedIn: 'root' })
export class TokensAutorizacionesService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  tokenAuthorizationByNicknameAndPassword(
    loginCredencialesI: LoginCredencialesI
  ): Observable<ResponseTokenAutorizacionI> {
    return this.http.post<ResponseTokenAutorizacionI>(
      `${this.baseUrl}/login`,
      loginCredencialesI
    );
  }
}
