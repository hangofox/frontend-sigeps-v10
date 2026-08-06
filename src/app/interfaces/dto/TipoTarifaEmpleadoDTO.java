//DECLARACIÓN DE PAQUETES:
package com.backendsigepsv10.com.co.backendsigepsv10.dominio.dto;

//IMPORTACIÓN DE LIBRERIAS:
import lombok.Data;

/**
* @Autor HERNAN ADOLFO NUÑEZ GONZALEZ / DAVID GIOVANNI PAEZ OVALLE.
* @Since 04/08/2026.
* Declaración del método DTO.
*/
@Data//DECLARACIÓN DE LA DATA PARA LOS DATOS DE LA TABLA DE LA BASE DE DATOS PARA LOS DTO.
//Anotacion de lombok que me crea automaticamente los get, set constructor.
public class TipoTarifaEmpleadoDTO {
    
    //DECLARACIÓN DE LAS VARIABLES DE LOS CAMPOS DE LA TABLA DE LA BASE DE DATOS PARA LOS DTO:
    private Long idTipoTarifaEmpleado;
    private String nombreTipoTarifaEmpleado;
    private String descripcionTipoTarifaEmpleado;
    private String estadoTipoTarifaEmpleado;
}
