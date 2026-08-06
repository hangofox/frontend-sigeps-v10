//DECLARACIÓN DE PAQUETES:
package com.backendsigepsv10.com.co.backendsigepsv10.web.controller;

//IMPORTACIÓN DE LIBRERIAS:
import com.backendsigepsv10.com.co.backendsigepsv10.dominio.dto.RespuestaDTO;
import com.backendsigepsv10.com.co.backendsigepsv10.dominio.dto.TarifaEmpleadoDTO;
import com.backendsigepsv10.com.co.backendsigepsv10.dominio.service.TarifaEmpleadoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
* @Autor HERNAN ADOLFO NUÑEZ GONZALEZ / DAVID GIOVANNI PAEZ OVALLE.
* @Since 05/08/2026.
* Declaración del controlador.
*/
@RestController//DECLARACIÓN DEL CONTROLADOR PARA LOS CRUDS.
@RequestMapping("")//DECLARACIÓN DE LA RESPUESTA PRINCIPAL DEL MAPEO DE LOS CRUDS.
public class TarifaEmpleadoController {
    
    @Autowired//INYECTAMOS EL SERVICIO.
    private TarifaEmpleadoService tarifaEmpleadoService;
    
    //CONTROLADORES DE CRUDS (CREACIÓN, LECTURA (LISTAR Y CONSULTAR), EDICIÓN Y ELIMINACIÓN DE UN REGISTRO).
    
    //CONTAR TOTAL DE REGISTROS FILTRADOS:
    @GetMapping("/tarifasEmpleados/count")//DECLARACIÓN DEL MAPEO DEL CRUD CONTAR REGISTROS.
    public ResponseEntity<Long> contarTotalRegistros(
            @RequestParam(required = false) Long idTarifaEmpleado,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long idTipoEmpleado,
            @RequestParam(required = false) Long idTipoEmpleadoPlanta,
            @RequestParam(required = false) Long idClasificacionEmpleadoPlanta,
            @RequestParam(required = false) Long idSubclasificacionEmpleadoPlanta,
            @RequestParam(required = false) Long idTipoTarifaEmpleado,
            @RequestParam(required = false) Long anioTarifaEmpleado,
            @RequestParam(required = false) String estadoTarifaEmpleado) {
        return new ResponseEntity<>(tarifaEmpleadoService.contarTotalRegistros(idTarifaEmpleado, keyword, idTipoEmpleado, idTipoEmpleadoPlanta, idClasificacionEmpleadoPlanta, idSubclasificacionEmpleadoPlanta, idTipoTarifaEmpleado, anioTarifaEmpleado, estadoTarifaEmpleado), HttpStatus.OK);
    }
    
    //LISTAR REGISTROS FILTRADOS SIN PAGINACIÓN:
    @GetMapping("/tarifasEmpleados/lista")//DECLARACIÓN DEL MAPEO DEL CRUD LISTAR REGISTROS.
    public ResponseEntity<List<TarifaEmpleadoDTO>> listarTarifasEmpleadosLista(
            @RequestParam(required = false) Long idTarifaEmpleado,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long idTipoEmpleado,
            @RequestParam(required = false) Long idTipoEmpleadoPlanta,
            @RequestParam(required = false) Long idClasificacionEmpleadoPlanta,
            @RequestParam(required = false) Long idSubclasificacionEmpleadoPlanta,
            @RequestParam(required = false) Long idTipoTarifaEmpleado,
            @RequestParam(required = false) Long anioTarifaEmpleado,
            @RequestParam(required = false) String estadoTarifaEmpleado,
            @RequestParam(required = false) String orderBy,
            @RequestParam(required = false, defaultValue = "ASC") String orderMode) {
        return new ResponseEntity<>(tarifaEmpleadoService.listarTarifasEmpleados(idTarifaEmpleado, keyword, idTipoEmpleado, idTipoEmpleadoPlanta, idClasificacionEmpleadoPlanta, idSubclasificacionEmpleadoPlanta, idTipoTarifaEmpleado, anioTarifaEmpleado, estadoTarifaEmpleado, orderBy, orderMode), HttpStatus.OK);
    }
    
    //LISTAR REGISTROS FILTRADOS PAGINADOS:
    @GetMapping("/tarifasEmpleados/listaPag")//DECLARACIÓN DEL MAPEO DEL CRUD LISTAR REGISTROS PAGINADOS.
    public ResponseEntity<Slice<TarifaEmpleadoDTO>> listarTarifasEmpleadosPag(
            @RequestParam(required = false) Long idTarifaEmpleado,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long idTipoEmpleado,
            @RequestParam(required = false) Long idTipoEmpleadoPlanta,
            @RequestParam(required = false) Long idClasificacionEmpleadoPlanta,
            @RequestParam(required = false) Long idSubclasificacionEmpleadoPlanta,
            @RequestParam(required = false) Long idTipoTarifaEmpleado,
            @RequestParam(required = false) Long anioTarifaEmpleado,
            @RequestParam(required = false) String estadoTarifaEmpleado,
            @RequestParam(required = false) String orderBy,
            @RequestParam(required = false, defaultValue = "ASC") String orderMode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return new ResponseEntity<>(tarifaEmpleadoService.listarTarifasEmpleadosPag(pageable, idTarifaEmpleado, keyword, idTipoEmpleado, idTipoEmpleadoPlanta, idClasificacionEmpleadoPlanta, idSubclasificacionEmpleadoPlanta, idTipoTarifaEmpleado, anioTarifaEmpleado, estadoTarifaEmpleado, orderBy, orderMode), HttpStatus.OK);
    }
    
    //CREAR REGISTRO:
    @PostMapping("/tarifasEmpleados")//DECLARACIÓN DEL MAPEO DEL CRUD CREAR REGISTRO.
    public RespuestaDTO crearTarifaEmpleado(@RequestBody TarifaEmpleadoDTO tarifaEmpleadoDTO){
        System.out.println(tarifaEmpleadoDTO);
        return tarifaEmpleadoService.crearTarifaEmpleado(tarifaEmpleadoDTO);
    }
    
    //LEER CONSULTA DE REGISTRO POR ID:
    @GetMapping("/tarifasEmpleados/{idTarifaEmpleado}")//DECLARACIÓN DEL MAPEO DEL CRUD CONSULTAR REGISTRO.
    public RespuestaDTO consultarTarifaEmpleadoporId(@PathVariable Long idTarifaEmpleado){
        return tarifaEmpleadoService.consultarTarifaEmpleadoporId(idTarifaEmpleado);
    }
    
    //LEER CONSULTA DE REGISTRO POR ID DE TIPO DE EMPLEADO, TIPO DE EMPLEADO PLANTA, CLASIFICACION, SUBCLASIFICACION, TIPO DE TARIFA Y AÑO:
    @GetMapping("/tarifasEmpleados/idTipoEmpleado/{idTipoEmpleado}/idTipoEmpleadoPlanta/{idTipoEmpleadoPlanta}/idClasificacionEmpleadoPlanta/{idClasificacionEmpleadoPlanta}/idSubclasificacionEmpleadoPlanta/{idSubclasificacionEmpleadoPlanta}/idTipoTarifaEmpleado/{idTipoTarifaEmpleado}/anio/{anioTarifaEmpleado}")//DECLARACIÓN DEL MAPEO DEL CRUD CONSULTAR REGISTRO.
    public RespuestaDTO consultarTarifaEmpleadoporIdTipoEmpleadoIdTipoEmpleadoPlantaIdClasificacionEmpleadoPlantaIdSubclasificacionEmpleadoPlantaIdTipoTarifaEmpleadoyAnio(@PathVariable Long idTipoEmpleado, @PathVariable Long idTipoEmpleadoPlanta, @PathVariable Long idClasificacionEmpleadoPlanta, @PathVariable Long idSubclasificacionEmpleadoPlanta, @PathVariable Long idTipoTarifaEmpleado, @PathVariable Long anioTarifaEmpleado){
        return tarifaEmpleadoService.consultarTarifaEmpleadoporIdTipoEmpleadoIdTipoEmpleadoPlantaIdClasificacionEmpleadoPlantaIdSubclasificacionEmpleadoPlantaIdTipoTarifaEmpleadoyAnio(idTipoEmpleado, idTipoEmpleadoPlanta, idClasificacionEmpleadoPlanta, idSubclasificacionEmpleadoPlanta, idTipoTarifaEmpleado, anioTarifaEmpleado);
    }
    
    //MODIFICAR REGISTRO:
    @PutMapping("/tarifasEmpleados")//DECLARACIÓN DEL MAPEO DEL CRUD MODIFICAR REGISTRO.
    public RespuestaDTO actualizarTarifaEmpleado(@RequestBody TarifaEmpleadoDTO tarifaEmpleadoDTO){
        return tarifaEmpleadoService.actualizarTarifaEmpleado(tarifaEmpleadoDTO);
    }
    
    //ELIMINAR REGISTRO:
    @DeleteMapping("/tarifasEmpleados/{idTarifaEmpleado}")//DECLARACIÓN DEL MAPEO DEL CRUD ELIMINAR REGISTRO.
    public RespuestaDTO eliminarTarifaEmpleado(@PathVariable Long idTarifaEmpleado){
        return tarifaEmpleadoService.eliminarTarifaEmpleado(idTarifaEmpleado);
    }
}
