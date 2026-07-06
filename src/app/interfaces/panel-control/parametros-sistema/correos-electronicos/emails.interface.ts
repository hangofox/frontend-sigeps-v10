export interface EmailsI {
    //ESTE OBJETO SOLO IDENTIFICA AL USUARIO Y EL MEDIO DE ENVÍO ELEGIDO. EmailServiceImpl (backend) RESUELVE
    //INTERNAMENTE TODO LO DEMÁS CONSULTANDO LA BASE DE DATOS: EL CORREO ELECTRÓNICO DE DESTINO (Usuario, según
    //medioEnvio), EL NÚMERO DE DOCUMENTO DE IDENTIFICACIÓN (Usuario), EL CÓDIGO DE ACTIVACIÓN VIGENTE
    //(RecuperacionContrasenaAccesoUsuario, el más reciente para ese usuario), Y EL ASUNTO, LA PLANTILLA HTML Y
    //LA CONFIGURACIÓN SMTP (ParametrosSistema). NINGUNO DE ESOS DATOS VIAJA POR EL NAVEGADOR.
    idUsuario: number;
    medioEnvio: String;//ESPERA "INSTITUCIONAL" O "PERSONAL".
}

export interface EmailsMsj {
    mensaje: string;
}