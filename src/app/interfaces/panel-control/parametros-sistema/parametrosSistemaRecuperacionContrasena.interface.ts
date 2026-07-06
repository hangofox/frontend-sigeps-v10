//DTO LIVIANO Y PÚBLICO (SIN AUTENTICACIÓN) CON EL ÚNICO DATO DE ParametrosSistema QUE EL FLUJO DE
//RECUPERACIÓN DE CONTRASEÑA NECESITA ANTES DE INICIAR SESIÓN. DELIBERADAMENTE NO INCLUYE NINGUNO DE LOS
//CAMPOS SMTP NI LA PLANTILLA DEL CORREO, QUE EmailServiceImpl (backend) CONSULTA Y ARMA INTERNAMENTE.
export interface ParametrosSistemaRecuperacionContrasenaI {
    tiempoMinutosValidezCodigoActivacionSistema: number;
}

export interface ResponseParametrosSistemaRecuperacionContrasenaDTO {
    parametrosSistemaRecuperacionContrasenaDTO: ParametrosSistemaRecuperacionContrasenaI;
    mensaje: string;
}
