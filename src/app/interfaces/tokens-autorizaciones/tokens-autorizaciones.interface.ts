export interface ResponseTokenAutorizacionI {
  tokenAutorizacion: string;
  tipoToken: string;
  expiracionToken: number;
  mensaje: string;
}

export interface TokenPayloadI {
  sub: string;
  iat: number;
  exp: number;
}
