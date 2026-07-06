export interface LoginCredencialesI {
  nicknameUsuario: string;
  passwordUsuario: string;
}

export interface LoginCredencialesMsjI {
  mensaje: string;
}

export interface UsuarioLoginDTO {
  idUsuario: number;
  nicknameUsuario: string;
  nombreUsuario: string;
  apellidoUsuario: string;
  correoUsuario: string;
  estadoUsuario: string;
}

export interface ResponseLoginI {
  mensaje: string;
  usuarioDTO: UsuarioLoginDTO;
}
