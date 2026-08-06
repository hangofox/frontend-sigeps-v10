//DECLARACIÓN DE PAQUETES:
package com.backendsigepsv10.com.co.backendsigepsv10.web.controller;

//IMPORTACIÓN DE LIBRERIAS:
import com.backendsigepsv10.com.co.backendsigepsv10.dominio.dto.RespuestaDTO;
import com.backendsigepsv10.com.co.backendsigepsv10.dominio.dto.TipoTarifaEmpleadoDTO;
import com.backendsigepsv10.com.co.backendsigepsv10.dominio.service.TipoTarifaEmpleadoService;
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
* @Since 04/08/2026.
* Declaración del controlador.
*/
@RestController//DECLARACIÓN DEL CONTROLADOR PARA LOS CRUDS.
@RequestMapping("")//DECLARACIÓN DE LA RESPUESTA PRINCIPAL DEL MAPEO DE LOS CRUDS.
public class TipoTarifaEmpleadoController {
    
    @Autowired//INYECTAMOS EL SERVICIO.
    private TipoTarifaEmpleadoService tipoTarifaEmpleadoService;
    
    //CONTROLADORES DE CRUDS (CREACIÓN, LECTURA (LISTAR Y CONSULTAR), EDICIÓN Y ELIMINACIÓN DE UN REGISTRO).
    
    //CONTAR TOTAL DE REGISTROS FILTRADOS:
    @GetMapping("/tiposTarifasEmpleados/count")//DECLARACIÓN DEL MAPEO DEL CRUD CONTAR REGISTROS.
    public ResponseEntity<Long> contarTotalRegistros(
            @RequestParam(required = false) Long idTipoTarifaEmpleado,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String estadoTipoTarifaEmpleado) {
        return new ResponseEntity<>(tipoTarifaEmpleadoService.contarTotalRegistros(idTipoTarifaEmpleado, keyword, estadoTipoTarifaEmpleado), HttpStatus.OK);
    }
    
    //LISTAR REGISTROS FILTRADOS SIN PAGINACIÓN:
    @GetMapping("/tiposTarifasEmpleados/lista")//DECLARACIÓN DEL MAPEO DEL CRUD LISTAR REGISTROS.
    public ResponseEntity<List<TipoTarifaEmpleadoDTO>> listarTiposTarifasEmpleadosLista(
            @RequestParam(required = false) Long idTipoTarifaEmpleado,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String estadoTipoTarifaEmpleado,
            @RequestParam(required = false) String orderBy,
            @RequestParam(required = false, defaultValue = "ASC") String orderMode) {
        return new ResponseEntity<>(tipoTarifaEmpleadoService.listarTiposTarifasEmpleados(idTipoTarifaEmpleado, keyword, estadoTipoTarifaEmpleado, orderBy, orderMode), HttpStatus.OK);
    }
    
    //LISTAR REGISTROS FILTRADOS PAGINADOS:
    @GetMapping("/tiposTarifasEmpleados/listaPag")//DECLARACIÓN DEL MAPEO DEL CRUD LISTAR REGISTROS PAGINADOS.
    public ResponseEntity<Slice<TipoTarifaEmpleadoDTO>> listarTiposTarifasEmpleadosPag(
            @RequestParam(required = false) Long idTipoTarifaEmpleado,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String estadoTipoTarifaEmpleado,
            @RequestParam(required = false) String orderBy,
            @RequestParam(required = false, defaultValue = "ASC") String orderMode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return new ResponseEntity<>(tipoTarifaEmpleadoService.listarTiposTarifasEmpleadosPag(pageable, idTipoTarifaEmpleado, keyword, estadoTipoTarifaEmpleado, orderBy, orderMode), HttpStatus.OK);
    }
    
    //CREAR REGISTRO:
    @PostMapping("/tiposTarifasEmpleados")//DECLARACIÓN DEL MAPEO DEL CRUD CREAR REGISTRO.
    public RespuestaDTO crearTipoTarifaEmpleado(@RequestBody TipoTarifaEmpleadoDTO tipoTarifaEmpleadoDTO){
        System.out.println(tipoTarifaEmpleadoDTO);
        return tipoTarifaEmpleadoService.crearTipoTarifaEmpleado(tipoTarifaEmpleadoDTO);
    }
    
    //LEER CONSULTA DE REGISTRO POR ID:
    @GetMapping("/tiposTarifasEmpleados/{idTipoTarifaEmpleado}")//DECLARACIÓN DEL MAPEO DEL CRUD CONSULTAR REGISTRO.
    public RespuestaDTO consultarTipoTarifaEmpleadoporId(@PathVariable Long idTipoTarifaEmpleado){
        return tipoTarifaEmpleadoService.consultarTipoTarifaEmpleadoporId(idTipoTarifaEmpleado);
    }
    
    //LEER CONSULTA DE REGISTRO POR NOMBRE:
    @GetMapping("/tiposTarifasEmpleados/nombre/{nombreTipoTarifaEmpleado}")//DECLARACIÓN DEL MAPEO DEL CRUD CONSULTAR REGISTRO.
    public RespuestaDTO consultarTipoTarifaEmpleadoporNombre(@PathVariable String nombreTipoTarifaEmpleado){
        return tipoTarifaEmpleadoService.consultarTipoTarifaEmpleadoporNombre(nombreTipoTarifaEmpleado);
    }
    
    //MODIFICAR REGISTRO:
    @PutMapping("/tiposTarifasEmpleados")//DECLARACIÓN DEL MAPEO DEL CRUD MODIFICAR REGISTRO.
    public RespuestaDTO actualizarTipoTarifaEmpleado(@RequestBody TipoTarifaEmpleadoDTO tipoTarifaEmpleadoDTO){
        return tipoTarifaEmpleadoService.actualizarTipoTarifaEmpleado(tipoTarifaEmpleadoDTO);
    }
    
    //ELIMINAR REGISTRO:
    @DeleteMapping("/tiposTarifasEmpleados/{idTipoTarifaEmpleado}")//DECLARACIÓN DEL MAPEO DEL CRUD ELIMINAR REGISTRO.
    public RespuestaDTO eliminarTipoTarifaEmpleado(@PathVariable Long idTipoTarifaEmpleado){
        return tipoTarifaEmpleadoService.eliminarTipoTarifaEmpleado(idTipoTarifaEmpleado);
    }
}
