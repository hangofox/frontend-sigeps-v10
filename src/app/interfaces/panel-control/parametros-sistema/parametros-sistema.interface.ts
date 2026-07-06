export interface ParametrosSistemaI {
    idParametrosSistema?: number;
    tiempoMinutosSesionInactivaSistema: number;
    tiempoMinutosValidezCodigoActivacionSistema: number;
    rutaDestinoCarpetaPrincipalServidorAplicaciones: String;
    rutaDestinoCarpetaCargueTemporalArchivos: String;
    rutaDestinoArchivosUsuarios: String;
    rutaDestinoArchivosEmpleados: String;
    authEnable: String;
    startTtlsEnable: String;
    smtpHost: String;
    smtpPort: String;
    smtpProtocols: String;
    usuarioRemitente: String;
    passwordRemitente: String;
    correoElectronicoRemitente: String;
    asuntoDestinatarioRecuperacionContrasena: String;
    cuerpoMensajeHtmlRecuperacionContrasena: String;
}

export interface ParametrosSistemaMsj {
  mensaje: string;
}
