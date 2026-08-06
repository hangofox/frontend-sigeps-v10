//DECLARACIÓN DE PAQUETES:
package com.backendsigepsv10.com.co.backendsigepsv10.dominio.dto;

//IMPORTACIÓN DE LIBRERIAS:
import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;

/**
* @Autor HERNAN ADOLFO NUÑEZ GONZALEZ / DAVID GIOVANNI PAEZ OVALLE.
* @Since 05/08/2026.
* Declaración del método DTO.
*/
@Data//DECLARACIÓN DE LA DATA PARA LOS DATOS DE LA TABLA DE LA BASE DE DATOS PARA EL DTO.
public class TarifaEmpleadoDTO {
    
    //DECLARACIÓN DE LAS VARIABLES DEL DTO:
    private Long idTarifaEmpleado;
    private Long anioTarifaEmpleado;
    private BigDecimal valorHoraTarifaEmpleado;
    private Date fechaHMSIngresoTarifaEmpleado;
    private Date fechaHMSModificacionTarifaEmpleado;
    private String estadoTarifaEmpleado;
    
    private TipoEmpleadoDTO tipoEmpleadoDTO;
    private TipoEmpleadoPlantaDTO tipoEmpleadoPlantaDTO;
    private ClasificacionEmpleadoPlantaDTO clasificacionEmpleadoPlantaDTO;
    private SubclasificacionEmpleadoPlantaDTO subclasificacionEmpleadoPlantaDTO;
    private TipoTarifaEmpleadoDTO tipoTarifaEmpleadoDTO;
}
