import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
//import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseTokenCodigoActivacionRecuperacionContrasenaDTO } from '../../../../interfaces/panel-control/parametros-sistema/tok-cod-activ-recup_contrasenas/responseTokenCodigoActivacionRecuperacionContrasenaDTO.interface';
//import { TokensCodigosActivacionesRecuperacionesContrasenasI, TokensCodigosActivacionesRecuperacionesContrasenasMsj } from '../../../../interfaces/panel-control/parametros-sistema/tok-cod-activ-recup_contrasenas/tokensCodigosActivacionesRecuperacionesContrasenas.interface';

@Injectable({
  providedIn: 'root'
})
export class TokensCodigosActivacionesRecuperacionesContrasenasService {
  
  //SI EL PROYECTO SE DESPLIEGA EN DESAROLLO ASIGNA LA IP DEL SERVIDOR DE DESARROLLO, SI EL PROYECTO SE DESPLIEGA EN PRUEBAS O PRODUCCIÓN TRAE LA IP DEL SERVIDOR DE PRUEBAS O PRODUCCIÓN:
  private baseUrl = environment.baseUrl;
  
  constructor(private http: HttpClient) {}
  
  getTokenActivationCodeRecoveryPasswordbyTiempoMinutozValidez(tiempoMinutosValidez: number): Observable<ResponseTokenCodigoActivacionRecuperacionContrasenaDTO> {
     return this.http.get<ResponseTokenCodigoActivacionRecuperacionContrasenaDTO>(`${this.baseUrl}/tokenCodigoActivacion/getTokenCodigoActivacionRecuperacionContrasenaporTiempoMinutosValidez/${tiempoMinutosValidez}`);
  }

}
